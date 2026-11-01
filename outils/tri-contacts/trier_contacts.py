#!/usr/bin/env python3
"""
Tri des contacts iCloud (vCard) et Google (CSV) pour la prospection de Comptoir Légal.

Usage :
    python3 trier_contacts.py iCloud.vcf contacts.csv [autres fichiers…] -o contacts_tries.xlsx

Ce que fait le script :
  1. lit les fichiers .vcf (iCloud, iPhone, Android) et .csv (export « CSV Google ») ;
  2. reconnaît chaque numéro : France (outre-mer compris), Israël, autre pays, ou ambigu ;
  3. fusionne les doublons (même numéro ou même e-mail présent dans plusieurs carnets) ;
  4. propose une catégorie (notaire, expert-comptable, avocat, dentiste, chef d'entreprise…)
     à partir du nom, de la société, de la fonction, des notes, des groupes et de l'e-mail ;
  5. produit un classeur Excel : un onglet par usage, un message prêt à envoyer
     et un lien WhatsApp / SMS par contact.

Rien n'est envoyé sur Internet : tout se passe sur l'ordinateur qui lance le script.
Seule dépendance : openpyxl (pip install openpyxl).
"""

from __future__ import annotations

import argparse
import csv
import io
import quopri
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from dataclasses import dataclass, field, replace
from pathlib import Path
from urllib.parse import quote

# ---------------------------------------------------------------------------
# Messages proposés (modifiables). Chaque message est assemblé à partir de la
# catégorie du contact, de son prénom et de sa société, avec des tournures qui
# varient d'un contact à l'autre : aucun envoi ne ressemble à un message groupé.
# Le texte reste modifiable dans WhatsApp avant l'envoi.
# ---------------------------------------------------------------------------

ACCROCHES = {
    'tu': ['j’espère que tu vas bien', 'j’espère que tout va bien de ton côté',
           'ça fait un moment, j’espère que tu vas bien', 'j’espère que toi et ta famille allez bien'],
    'vous': ['j’espère que vous allez bien', 'j’espère que tout va bien de votre côté',
             'j’espère que vous allez bien depuis notre dernier échange'],
}

PRESENTATIONS = [
    'Je lance {site}, une plateforme d’annonces légales (au tarif officiel) et de formalités d’entreprise.',
    'Je me lance dans un nouveau projet : {site}, les annonces légales et les formalités d’entreprise, en quelques clics.',
]

# Demande adaptée à la catégorie. {societe} = nom de la société du contact.
DEMANDES = {
    'Notaire': {
        'vous': 'Vos actes (constitutions de SCI, cessions, changements de régime matrimonial) passent souvent '
                'par une annonce légale : je serais heureux de vous montrer comment nous les traitons en quelques '
                'minutes. Auriez-vous 15 minutes pour un appel ?',
        'tu': 'Tes actes (SCI, cessions, changements de régime matrimonial) passent souvent par une annonce '
              'légale : j’aimerais te montrer comment on les traite en quelques minutes. Tu aurais 15 minutes ?',
    },
    'Expert-comptable': {
        'vous': 'Pour un cabinet, c’est moins de saisie, des dossiers bouclés plus vite et un interlocuteur dédié '
                'pour les formalités de vos clients. Auriez-vous 15 minutes pour que je vous la présente ?',
        'tu': 'Pour ton cabinet, c’est moins de saisie, des dossiers bouclés plus vite et un interlocuteur dédié '
              'pour les formalités de tes clients. Tu aurais 15 minutes pour que je te la montre ?',
    },
    'Avocat': {
        'vous': 'Pour les opérations de vos clients (constitutions, cessions, transformations), nous publions '
                'l’annonce et suivons la formalité jusqu’au Kbis. Auriez-vous 15 minutes pour en parler ?',
        'tu': 'Pour les opérations de tes clients (constitutions, cessions, transformations), on publie '
              'l’annonce et on suit la formalité jusqu’au Kbis. Tu aurais 15 minutes pour en parler ?',
    },
    'Santé (dentiste, médecin…)': {
        'vous': 'Pour votre cabinet, vous travaillez sûrement avec un expert-comptable : accepteriez-vous de me '
                'mettre en relation avec lui ? Je souhaite lui présenter la plateforme, de votre part.',
        'tu': 'Pour ton cabinet, tu travailles sûrement avec un expert-comptable : tu accepterais de me le '
              'présenter ? J’aimerais l’appeler de ta part.',
    },
    'Chef d’entreprise / dirigeant': {
        'vous': 'Pour {societe}, vous travaillez forcément avec un expert-comptable : accepteriez-vous de me mettre '
                'en relation avec lui ? Et pour vos propres formalités (transfert de siège, changement de gérant…), '
                'je m’en occupe volontiers.',
        'tu': 'Pour {societe}, tu travailles forcément avec un expert-comptable : tu accepterais de me le présenter ? '
              'Et si un jour tu as une formalité à faire (transfert de siège, changement de gérant…), je m’en occupe.',
    },
    'Immobilier': {
        'vous': 'Vos clients qui créent une SCI passent par une annonce légale : nous pourrions travailler ensemble. '
                'Et si vous avez un expert-comptable ou un notaire à me présenter, ce serait précieux.',
        'tu': 'Tes clients qui créent une SCI passent par une annonce légale : on pourrait travailler ensemble. '
              'Et si tu as un expert-comptable ou un notaire à me présenter, ce serait précieux.',
    },
    'Banque, assurance, patrimoine': {
        'vous': 'Vous accompagnez des chefs d’entreprise : j’aimerais en parler avec vous. Et si vous avez un '
                'expert-comptable ou un notaire à me présenter, ce serait précieux.',
        'tu': 'Tu accompagnes des chefs d’entreprise : j’aimerais en parler avec toi. Et si tu as un '
              'expert-comptable ou un notaire à me présenter, ce serait précieux.',
    },
    'Ancien client / acquéreur': {
        'vous': 'J’ai un service à vous demander : qui est votre expert-comptable (ou votre notaire) ? J’aimerais '
                'lui présenter la plateforme de votre part.',
        'tu': 'J’ai un petit service à te demander : qui est ton expert-comptable (ou ton notaire) ? J’aimerais '
              'lui présenter la plateforme de ta part.',
    },
    # Cibles directes sans précision (« Maître », huissier, mandataire…)
    'A': {
        'vous': 'Je serais heureux de vous la présenter en 15 minutes, au téléphone ou en visio. Seriez-vous disponible ?',
        'tu': 'J’aimerais te la présenter en 15 minutes, au téléphone ou en visio. Tu serais disponible ?',
    },
    # Tous les autres (amis, famille, anciens élèves, artisans, contacts à classer)
    'defaut': {
        'vous': 'Connaîtriez-vous un expert-comptable, un notaire ou un avocat d’affaires (le vôtre, celui de votre '
                'société…) à qui je pourrais la présenter de votre part ?',
        'tu': 'Petit service : tu connais un expert-comptable, un notaire ou un avocat d’affaires (le tien, celui de '
              'ta société…) que je pourrais appeler de ta part ?',
    },
}

CLOTURES = {
    'tu': ['Merci d’avance !', 'Merci, ça m’aiderait beaucoup !', 'Merci à toi !'],
    'vous': ['Merci par avance.', 'Merci beaucoup.', 'Avec mes remerciements.'],
}

SEGMENTS = {
    'A': '1 · Cible directe',
    'B': '2 · Prescripteur',
    'C': '3 · Réseau personnel',
    'X': '4 · À écarter',
}

STATUTS = [
    'À contacter', 'Message envoyé', 'Relancé', 'Recommandation obtenue',
    'RDV fixé', 'Client actif', 'Pas intéressé',
]

# ---------------------------------------------------------------------------
# Catégories : (nom, segment, motifs). Les motifs sont cherchés dans le texte du
# contact mis en minuscules et sans accents. L'ordre fixe la catégorie retenue
# quand plusieurs correspondent ; les autres sont gardées comme « indices ».
# ---------------------------------------------------------------------------

REGLES = [
    ('Notaire', 'A', [
        r'\bnotair', r'\bnotarial', r'\bclerc de notaire', r'\betude notariale']),
    ('Expert-comptable', 'A', [
        r'\bexpert[\s-]*comptab', r'\bexpertise[\s-]*comptab', r'\bcomptab', r'\bcompta\b',
        r'\bcommissaire aux comptes', r'\bfiduciaire', r'\bcabinet d.?audit', r'\bcpa\b',
        r'\bin extenso\b', r'\bfiducial\b', r'\bkpmg\b', r'\bmazars\b', r'\bforvis\b', r'\bdeloitte\b',
        r'\bgrant thornton\b', r'\bbaker tilly\b', r'\bcerfrance\b', r'\bkeobiz\b', r'\bexco\b']),
    ('Avocat', 'A', [
        r'\bavocat', r'\bbarreau\b', r'\baarpi\b', r'law(yers?|firm)?\b', r'\battorneys?\b',
        r'\bjuriste', r'\bjuridique', r'\bfidal\b', r'\bconseil juridique']),
    ('Maître (avocat ou notaire, à préciser)', 'A', []),  # repéré par le titre en tête du nom
    ('Autre profession juridique', 'A', [
        r'\bhuissier', r'\bcommissaire de justice', r'\bmandataire judiciaire',
        r'\badministrateur judiciaire', r'\bliquidateur', r'\bgreffe\b', r'\bformaliste']),
    ('Service / administration', 'X', [
        r'\bservice client', r'\bsav\b', r'\bhotline', r'\burgences?\b', r'\bdepann', r'\bmairie\b',
        r'\bimpots?\b', r'\burssaf\b', r'\bcaf\b', r'\bcpam\b', r'\bameli\b', r'\bsncf\b', r'\bedf\b',
        r'\bengie\b', r'\bsfr\b', r'\borange\b', r'\bbouygues telecom', r'\bfree mobile', r'\bla poste\b',
        r'\bpizz', r'\blivraison', r'\btaxis?\b', r'\buber\b', r'\bpharmacie de garde', r'\bhopital\b',
        r'\bpolice\b', r'\bpompiers\b', r'\bambassade', r'\bconsulat', r'\bamazon\b', r'\brepondeur',
        r'\bmessagerie vocale']),
    ('Banque, assurance, patrimoine', 'B', [
        r'\bbanqu', r'\bbank', r'\bcgp\b', r'\bpatrimoin', r'\bgestion de fortune', r'\bwealth',
        r'\bassuran', r'\bcourti', r'\bcourtage', r'\bbnp\b', r'\bsociete generale\b', r'\bcredit agricole\b',
        r'\blcl\b', r'\bcaisse d.?epargne\b', r'\bcic\b', r'\bhsbc\b', r'\bcredit mutuel\b', r'\baxa\b',
        r'\ballianz\b', r'\bgenerali\b', r'\bfinanc', r'\bprivate equity']),
    ('Immobilier', 'B', [
        r'\bimmo\b', r'\bimmobili', r'\bpromoteur', r'\bsyndic\b', r'\breal estate', r'\bnadlan',
        r'\bcentury ?21\b', r'\borpi\b', r'\bfoncia\b', r'\blaforet\b', r'\bguy hoquet\b', r'\bnexity\b',
        r'\bsafti\b', r'\bcapifrance\b', r'\barchitect', r'\bmarchand de biens']),
    ('Santé (dentiste, médecin…)', 'B', [
        r'\bdentist', r'\bdentaire', r'\borthodont', r'\bstomato', r'\bmedecin', r'\bdocteur\b',
        r'\bdr\b', r'\bcardiolog', r'\bdermato', r'\bophtalmo', r'\bradiolog', r'\bgyneco', r'\bpediatr',
        r'\bchirurg', r'\bkine', r'\bosteo', r'\bpharmac', r'\binfirmi', r'\bveterinaire',
        r'\bsage[\s-]femme', r'\bpsycholog', r'\bpsychiatr', r'\borthophon', r'\bpodolog', r'\bopticien',
        r'\bclinique', r'\bcabinet medical', r'\blaborat']),
    ('Ancien client / acquéreur', 'B', [
        r'\bclients?\b', r'\bacheteur', r'\bacquereur', r'\bappart', r'\bresidence\b', r'\breservation',
        r'\bvefa\b']),
    ('Chef d’entreprise / dirigeant', 'B', [
        r'\bgerante?\b', r'\bpresident', r'\bpdg\b', r'\bceo\b', r'\bdg\b', r'\bdirect(eur|rice)\b',
        r'\bfondat', r'\bco-?founder', r'\bfounder', r'\bowner\b', r'\bassociee?\b', r'\bentrepreneu',
        r'\bchef d.?entreprise', r'\bbusiness\b', r'\bmanager\b', r'\bholding\b', r'\bgroupe?\b']),
    ('Artisan / commerçant', 'C', [
        r'\bplomb', r'\belectric', r'\bmenuis', r'\bpeintre', r'\bmacon', r'\bcarrel', r'\bchauffag',
        r'\bclim', r'\bserrur', r'\bgarage\b', r'\bmecan', r'\brestaura', r'\bresto\b', r'\btraiteur',
        r'\bboulang', r'\bboucher', r'\bcoiff', r'\besthetic', r'\bpressing', r'\bvtc\b', r'\bdemenag',
        r'\bfleuriste', r'\bboutique', r'\bmagasin', r'\bbijout', r'\bimprim', r'\bpaysag',
        r'\bnettoyage', r'\bbtp\b', r'\btravaux', r'\brenovation']),
    ('Ancien élève', 'C', [
        r'\beleves?\b', r'\betudiant', r'\bstudent', r'\bpromo\b', r'\bstagiaire', r'\bformation\b']),
    ('Famille', 'C', [
        r'\bmaman\b', r'\bpapa\b', r'\bmere\b', r'\bpere\b', r'\bfrere\b', r'\bsoeur\b', r'\btonton\b',
        r'\btata\b', r'\btatie\b', r'\boncle\b', r'\btante\b', r'\bcousine?\b', r'\bmamie\b', r'\bpap[iy]\b',
        r'\bbeau[\s-]frere', r'\bbelle[\s-]soeur', r'\bbeau[\s-]pere', r'\bbelle[\s-]mere', r'\bneveu\b',
        r'\bniece\b', r'\bfamille\b', r'\bsaba\b', r'\bsavta\b']),
]

# Formes juridiques : cherchées dans la société (et dans le nom, sauf « SA » trop ambigu).
FORMES = r'\b(sas|sasu|sarl|eurl|sci|snc|selarl|selas|scp|scm|ltd|llc|inc|gmbh)\b'

TITRE_MAITRE = re.compile(r'^\s*(me|maitre)\b\.?', re.I)

MESSAGERIES = {
    'gmail.com', 'googlemail.com', 'hotmail.com', 'hotmail.fr', 'outlook.com', 'outlook.fr', 'live.com',
    'live.fr', 'msn.com', 'yahoo.com', 'yahoo.fr', 'ymail.com', 'icloud.com', 'me.com', 'mac.com',
    'orange.fr', 'wanadoo.fr', 'free.fr', 'sfr.fr', 'neuf.fr', 'laposte.net', 'aol.com', 'aol.fr',
    'bbox.fr', 'numericable.fr', 'club-internet.fr', 'gmx.fr', 'gmx.com', 'protonmail.com', 'proton.me',
    'walla.co.il', 'walla.com', '012.net.il', 'bezeqint.net', 'netvision.net.il', 'zahav.net.il',
}

ETIQUETTES_SYSTEME = {'mycontacts', 'starred', 'friends', 'family', 'coworkers', 'other contacts'}
NOMS_FICHIERS_GENERIQUES = re.compile(r'icloud|vcard|vcf|contact|google|export|tous|all|carnet|backup', re.I)

# ---------------------------------------------------------------------------
# Numéros de téléphone
# ---------------------------------------------------------------------------

OUTRE_MER = {
    '262': 'La Réunion / Mayotte', '269': 'Mayotte', '508': 'Saint-Pierre-et-Miquelon',
    '590': 'Guadeloupe', '594': 'Guyane', '596': 'Martinique', '681': 'Wallis-et-Futuna',
    '687': 'Nouvelle-Calédonie', '689': 'Polynésie française',
}

AUTRES_PAYS = {
    '1': 'États-Unis / Canada', '7': 'Russie', '20': 'Égypte', '27': 'Afrique du Sud', '30': 'Grèce',
    '31': 'Pays-Bas', '32': 'Belgique', '34': 'Espagne', '36': 'Hongrie', '39': 'Italie', '40': 'Roumanie',
    '41': 'Suisse', '43': 'Autriche', '44': 'Royaume-Uni', '45': 'Danemark', '46': 'Suède', '47': 'Norvège',
    '48': 'Pologne', '49': 'Allemagne', '52': 'Mexique', '54': 'Argentine', '55': 'Brésil', '61': 'Australie',
    '81': 'Japon', '86': 'Chine', '90': 'Turquie', '91': 'Inde', '212': 'Maroc', '213': 'Algérie',
    '216': 'Tunisie', '221': 'Sénégal', '225': 'Côte d’Ivoire', '351': 'Portugal', '352': 'Luxembourg',
    '353': 'Irlande', '357': 'Chypre', '377': 'Monaco', '380': 'Ukraine', '420': 'Tchéquie',
    '961': 'Liban', '962': 'Jordanie', '970': 'Palestine', '971': 'Émirats arabes unis',
}

PAYS_LIBELLE = {'FR': 'France', 'IL': 'Israël', 'AMBIGU': 'France ou Israël ?', 'INCONNU': 'format inconnu'}


@dataclass
class Numero:
    brut: str
    libelle: str = ''
    pays: str = 'INCONNU'      # FR, IL, AUTRE, AMBIGU, INCONNU
    e164: str = ''             # +33612345678
    affichage: str = ''
    certitude: str = ''        # sûr, probable, à vérifier
    explication: str = ''
    mobile: bool = False
    region: str = ''           # pays précis pour AUTRE, département d'outre-mer…
    hypotheses: tuple = ()     # pour AMBIGU : (Numero FR, Numero IL)


def _paires(chiffres: str) -> str:
    return ' '.join(chiffres[i:i + 2] for i in range(0, len(chiffres), 2))


def numero_fr(reste: str, brut: str, libelle: str, certitude: str, explication: str) -> Numero:
    """reste = 9 chiffres après +33."""
    return Numero(brut, libelle, 'FR', '+33' + reste, f'+33 {reste[0]} {_paires(reste[1:])}',
                  certitude, explication, reste[0] in '67')


def numero_il(reste: str, brut: str, libelle: str, certitude: str, explication: str) -> Numero:
    """reste = 8 ou 9 chiffres après +972."""
    if len(reste) == 9:
        aff = f'+972 {reste[:2]}-{reste[2:5]}-{reste[5:]}'
    else:
        aff = f'+972 {reste[0]}-{reste[1:4]}-{reste[4:]}'
    return Numero(brut, libelle, 'IL', '+972' + reste, aff, certitude, explication, reste[0] == '5')


def _ambigu(nfr: Numero, nil: Numero, brut: str, libelle: str, explication: str) -> Numero:
    return Numero(brut, libelle, 'AMBIGU', '', brut.strip(), 'à vérifier', explication,
                  nfr.mobile or nil.mobile, hypotheses=(nfr, nil))


def classer_numero(brut: str, libelle: str = '') -> Numero:
    """Reconnaît le pays d'un numéro tel qu'il est saisi dans le carnet."""
    s = brut.replace(' ', ' ').strip()
    s = re.sub(r'[‎‏‪-‮]', '', s)          # marques de direction (iPhone)
    s = re.split(r'[;,]|\s*(?:ext\.?|poste)\s*\d|[pPwW]', s)[0]  # extensions et pauses
    s = re.sub(r'\(0\)', '', s)                                 # +33 (0)6…
    chiffres = re.sub(r'\D', '', s)
    if not chiffres:
        return Numero(brut, libelle, explication='aucun chiffre')

    if s.startswith('+'):
        inter = chiffres
    elif chiffres.startswith('00'):
        inter = chiffres[2:]
    else:
        inter = None

    if inter is not None:
        if inter.startswith('33'):
            reste = inter[2:]
            if len(reste) == 10 and reste[0] == '0':
                reste = reste[1:]
            if len(reste) == 9 and reste[0] != '0':
                return numero_fr(reste, brut, libelle, 'sûr', 'indicatif +33')
            return Numero(brut, libelle, explication='+33 mais longueur incorrecte')
        if inter.startswith('972'):
            reste = inter[3:]
            if len(reste) in (9, 10) and reste[0] == '0':
                reste = reste[1:]
            if len(reste) in (8, 9) and reste[0] != '0':
                return numero_il(reste, brut, libelle, 'sûr', 'indicatif +972')
            return Numero(brut, libelle, explication='+972 mais longueur incorrecte')
        code = inter[:3]
        if code in OUTRE_MER:
            reste = inter[3:]
            return Numero(brut, libelle, 'FR', '+' + inter, f'+{code} {_paires(reste)}', 'sûr',
                          f'outre-mer ({OUTRE_MER[code]})', reste[:1] in ('6', '7'), OUTRE_MER[code])
        for n in (3, 2, 1):
            if inter[:n] in AUTRES_PAYS:
                return Numero(brut, libelle, 'AUTRE', '+' + inter, '+' + inter, 'sûr',
                              f'indicatif +{inter[:n]}', False, AUTRES_PAYS[inter[:n]])
        return Numero(brut, libelle, 'AUTRE', '+' + inter, '+' + inter, 'sûr', 'indicatif étranger',
                      False, 'Autre pays')

    n = chiffres
    if len(n) == 11 and n.startswith('33') and n[2] != '0':
        return numero_fr(n[2:], brut, libelle, 'probable', 'indicatif 33 sans « + »')
    if len(n) in (11, 12) and n.startswith('972'):
        return numero_il(n[3:], brut, libelle, 'probable', 'indicatif 972 sans « + »')

    if len(n) == 10 and n[0] == '0':
        reste = n[1:]
        if n[1] == '6':
            return numero_fr(reste, brut, libelle, 'sûr', 'mobile 06')
        if n[1] in '12349':
            return numero_fr(reste, brut, libelle, 'sûr', 'fixe français à 10 chiffres')
        if n[1] == '8':
            return numero_fr(reste, brut, libelle, 'sûr', 'numéro spécial 08')
        if n[1] in '57':
            nfr = numero_fr(reste, brut, libelle, 'probable', '')
            nil = numero_il(reste, brut, libelle, 'probable', '')
            if re.fullmatch(r'\s*0\d(?:[\s.\-]\d\d){4}\s*', s):
                return replace(nfr, explication='écrit à la française (par paires)')
            if re.fullmatch(r'\s*0\d\d[\s.\-]\d{3}[\s.\-]?\d{4}\s*|\s*0\d\d[\s.\-]\d{7}\s*', s):
                return replace(nil, explication='écrit à l’israélienne (0XX-XXX-XXXX)')
            if n[1] == '7' and n[2] in '015':
                return replace(nfr, explication='07 inexistant en Israël sur ce préfixe')
            lib = 'fixe Sud-Ouest' if n[1] == '5' else 'mobile 07'
            return _ambigu(nfr, nil, brut, libelle,
                           f'{n[:3]}… : {lib} en France, ou {"mobile" if n[1] == "5" else "fixe"} en Israël')
        return Numero(brut, libelle, explication='préfixe 00 inattendu')

    if len(n) == 9 and n[0] == '0':
        return numero_il(n[1:], brut, libelle, 'sûr', 'fixe israélien à 9 chiffres')

    if len(n) == 9:
        nfr = numero_fr(n, brut, libelle, 'probable', 'zéro initial manquant')
        if n[0] in '5':
            nil = numero_il(n, brut, libelle, 'probable', 'zéro initial manquant')
            return _ambigu(nfr, nil, brut, libelle, 'zéro initial manquant : France ou Israël')
        if n[0] == '7':
            nil = numero_il(n, brut, libelle, 'probable', 'zéro initial manquant')
            return _ambigu(nfr, nil, brut, libelle, 'zéro initial manquant : France ou Israël')
        return nfr

    if len(n) == 8 and n[0] in '23489':
        return numero_il(n, brut, libelle, 'probable', 'fixe israélien sans le zéro')

    return Numero(brut, libelle, explication='numéro court, de service ou incomplet')


# ---------------------------------------------------------------------------
# Contacts
# ---------------------------------------------------------------------------

@dataclass
class Contact:
    prenom: str = ''
    nom: str = ''
    nom_affiche: str = ''
    societes: list = field(default_factory=list)
    fonctions: list = field(default_factory=list)
    notes: list = field(default_factory=list)
    emails: list = field(default_factory=list)
    numeros: list = field(default_factory=list)
    etiquettes: list = field(default_factory=list)
    villes: list = field(default_factory=list)
    pays: list = field(default_factory=list)
    sources: list = field(default_factory=list)
    uid: str = ''
    est_societe: bool = False
    # calculés
    categorie: str = ''
    segment: str = ''
    indices: list = field(default_factory=list)

    def nom_complet(self) -> str:
        if self.nom_affiche:
            return self.nom_affiche
        complet = ' '.join(x for x in (self.prenom, self.nom) if x)
        return complet or (self.societes[0] if self.societes else '(sans nom)')


def _ajouter(liste: list, valeur: str):
    valeur = (valeur or '').strip()
    if valeur and valeur.lower() not in (v.lower() for v in liste):
        liste.append(valeur)


def normaliser(texte: str) -> str:
    texte = (texte or '').replace('’', "'").replace('œ', 'oe').replace('Œ', 'oe').replace('æ', 'ae')
    texte = unicodedata.normalize('NFKD', texte)
    return ''.join(c for c in texte if not unicodedata.combining(c)).lower()


def lire_texte(chemin: Path) -> str:
    brut = chemin.read_bytes()
    if brut.startswith((b'\xff\xfe', b'\xfe\xff')):
        return brut.decode('utf-16')
    for enc in ('utf-8-sig', 'cp1252'):
        try:
            return brut.decode(enc)
        except UnicodeDecodeError:
            continue
    return brut.decode('latin-1')


# ---- vCard (iCloud, iPhone, Android) ---------------------------------------

def _decoupe(valeur: str, sep: str = ';') -> list:
    return [_desechapper(p) for p in re.split(r'(?<!\\)' + re.escape(sep), valeur)]


def _desechapper(v: str) -> str:
    return (v.replace('\\n', '\n').replace('\\N', '\n').replace('\\,', ',')
             .replace('\\;', ';').replace('\\:', ':').replace('\\\\', '\\').strip())


def _nettoyer_libelle(lib: str) -> str:
    return re.sub(r'_\$!<(.*?)>!\$_', r'\1', lib or '').strip()


def lire_vcard(chemin: Path) -> list:
    texte = lire_texte(chemin)
    texte = re.sub(r'\r?\n[ \t]', '', texte)                  # lignes repliées (RFC 6350)
    lignes = texte.splitlines()
    fiches, groupes = [], []
    courant = None
    i = 0
    while i < len(lignes):
        ligne = lignes[i]
        i += 1
        if ':' not in ligne:
            continue
        entete, _, valeur = ligne.partition(':')
        morceaux = entete.split(';')
        groupe, _, prop = morceaux[0].rpartition('.')
        prop = prop.upper()
        params = [p for p in morceaux[1:]]
        params_bas = [p.lower() for p in params]
        if any('quoted-printable' in p for p in params_bas):
            while valeur.endswith('=') and i < len(lignes):   # retours à la ligne « doux »
                valeur = valeur[:-1] + lignes[i]
                i += 1
            charset = next((p.split('=', 1)[1] for p in params_bas if p.startswith('charset=')), 'utf-8')
            valeur = quopri.decodestring(valeur.encode('latin-1', 'replace')).decode(charset, 'replace')

        if prop == 'BEGIN' and valeur.strip().upper() == 'VCARD':
            courant = {'props': [], 'labels': {}}
            continue
        if courant is None:
            continue
        if prop == 'END':
            fiches.append(courant)
            courant = None
            continue
        if prop == 'X-ABLABEL':
            courant['labels'][groupe.lower()] = _nettoyer_libelle(valeur)
            continue
        if prop in ('PHOTO', 'LOGO', 'SOUND', 'KEY'):
            continue
        types = []
        for p in params_bas:
            p = p.split('=', 1)[1] if '=' in p else p
            types += [t.strip('"') for t in p.split(',')]
        courant['props'].append((groupe.lower(), prop, types, valeur))

    contacts, membres_par_groupe = [], []
    for fiche in fiches:
        c = Contact(sources=[f'iCloud/vCard ({chemin.name})'])
        genre = ''
        membres = []
        for groupe, prop, types, valeur in fiche['props']:
            if prop == 'FN':
                c.nom_affiche = _desechapper(valeur)
            elif prop == 'N':
                parties = _decoupe(valeur) + [''] * 5
                c.nom, c.prenom = parties[0], parties[1]
            elif prop == 'ORG':
                _ajouter(c.societes, ' '.join(p for p in _decoupe(valeur) if p))
            elif prop in ('TITLE', 'ROLE'):
                _ajouter(c.fonctions, _desechapper(valeur))
            elif prop == 'NOTE':
                _ajouter(c.notes, _desechapper(valeur))
            elif prop == 'EMAIL':
                _ajouter(c.emails, _desechapper(valeur).lower())
            elif prop == 'TEL':
                lib = fiche['labels'].get(groupe) or ', '.join(t for t in types if t not in ('voice', 'pref'))
                c.numeros.append(classer_numero(_desechapper(valeur), lib))
            elif prop == 'ADR':
                parties = _decoupe(valeur) + [''] * 7
                _ajouter(c.villes, parties[3])
                _ajouter(c.pays, parties[6])
            elif prop == 'CATEGORIES':
                for cat in _decoupe(valeur, ','):
                    _ajouter(c.etiquettes, cat)
            elif prop == 'UID':
                c.uid = valeur.strip().lower()
            elif prop == 'X-ABSHOWAS' and valeur.strip().upper() == 'COMPANY':
                c.est_societe = True
            elif prop in ('X-ADDRESSBOOKSERVER-KIND', 'KIND'):
                genre = valeur.strip().lower()
            elif prop in ('X-ADDRESSBOOKSERVER-MEMBER', 'MEMBER'):
                membres.append(valeur.strip().lower().replace('urn:uuid:', ''))
        if genre == 'group':
            membres_par_groupe.append((c.nom_affiche, membres))
        else:
            contacts.append(c)

    par_uid = {c.uid.replace('urn:uuid:', ''): c for c in contacts if c.uid}
    for nom_groupe, membres in membres_par_groupe:
        for uid in membres:
            if uid in par_uid:
                _ajouter(par_uid[uid].etiquettes, nom_groupe)
    return contacts


# ---- CSV (Google Contacts, Outlook, tableur) -------------------------------

def _col(entetes: dict, *motifs: str) -> list:
    """Colonnes dont l'en-tête normalisé correspond à l'un des motifs (regex complètes)."""
    return [orig for norm, orig in entetes.items() if any(re.fullmatch(m, norm) for m in motifs)]


def _valeurs(ligne: dict, colonnes: list) -> list:
    sortie = []
    for col in colonnes:
        for v in (ligne.get(col) or '').split(':::'):
            if v.strip():
                sortie.append(v.strip())
    return sortie


def lire_csv(chemin: Path) -> list:
    texte = lire_texte(chemin)
    premiere = texte.split('\n', 1)[0]
    sep = ';' if premiere.count(';') > premiere.count(',') else ','
    lecteur = csv.DictReader(io.StringIO(texte), delimiter=sep)
    entetes = {normaliser(h).strip(): h for h in (lecteur.fieldnames or []) if h}

    c_prenom = _col(entetes, r'first name', r'given name', r'prenom')
    c_milieu = _col(entetes, r'middle name', r'additional name')
    c_nom = _col(entetes, r'last name', r'family name', r'nom de famille', r'nom' if c_prenom else r'$^')
    c_complet = _col(entetes, r'name', r'display name', r'nom complet', r'nom' if not c_prenom else r'$^')
    c_classer = _col(entetes, r'file as')
    c_societe = _col(entetes, r'organi[sz]ation( \d)?( - |\s)?name', r'company', r'societe', r'entreprise',
                     r'organisation')
    c_fonction = _col(entetes, r'organi[sz]ation( \d)?( - |\s)?(title|department)', r'job title', r'fonction',
                      r'poste', r'titre', r'occupation')
    c_notes = _col(entetes, r'notes?')
    c_etiq = _col(entetes, r'labels', r'group membership', r'groupes?', r'libelles?', r'categories', r'etiquettes?')
    c_mail = _col(entetes, r'(e-?mail|courriel)( \d+)? - (value|valeur)', r'(e-?mail|courriel)( address| adresse)?( \d+)?',
                  r'adresse (e-?mail|electronique)( \d+)?')
    c_ville = _col(entetes, r'address \d+ - city', r'(home|business|other) city', r'ville')
    c_pays = _col(entetes, r'address \d+ - country', r'(home|business|other) country(/region)?', r'pays')

    c_tel = []
    for norm, orig in entetes.items():
        m = re.fullmatch(r'((?:phone|telephone|tel)( \d+)?) - (value|valeur)', norm)
        if m:
            lib = next((entetes[k] for k in (f'{m.group(1)} - label', f'{m.group(1)} - type',
                                              f'{m.group(1)} - libelle') if k in entetes), None)
            c_tel.append((orig, lib, ''))
        elif re.fullmatch(r'(mobile|home|business|work|other|primary|car|company|main|assistant|pager)'
                          r'( \d)? (phone|fax)|telephone( \w+)*|tel|portable|mobile|phone|numero', norm):
            c_tel.append((orig, None, orig))
    if not c_tel:
        print(f'  ⚠ {chemin.name} : aucune colonne de téléphone reconnue.', file=sys.stderr)

    contacts = []
    for ligne in lecteur:
        c = Contact(sources=[f'Google/CSV ({chemin.name})'])
        c.prenom = ' '.join(_valeurs(ligne, c_prenom))
        c.nom = ' '.join(_valeurs(ligne, c_nom))
        complet = ' '.join(_valeurs(ligne, c_complet))
        if not complet:
            complet = ' '.join(x for x in (c.prenom, ' '.join(_valeurs(ligne, c_milieu)), c.nom) if x)
        c.nom_affiche = complet or ' '.join(_valeurs(ligne, c_classer))
        for v in _valeurs(ligne, c_societe):
            _ajouter(c.societes, v)
        for v in _valeurs(ligne, c_fonction):
            _ajouter(c.fonctions, v)
        for v in _valeurs(ligne, c_notes):
            _ajouter(c.notes, v)
        for v in _valeurs(ligne, c_mail):
            _ajouter(c.emails, v.lower())
        for v in _valeurs(ligne, c_ville):
            _ajouter(c.villes, v)
        for v in _valeurs(ligne, c_pays):
            _ajouter(c.pays, v)
        for v in _valeurs(ligne, c_etiq):
            v = v.lstrip('* ').strip()
            if normaliser(v) not in ETIQUETTES_SYSTEME:
                _ajouter(c.etiquettes, v)
        for col_val, col_lib, lib_fixe in c_tel:
            libs = _valeurs(ligne, [col_lib]) if col_lib else []
            for k, v in enumerate(_valeurs(ligne, [col_val])):
                lib = libs[k] if k < len(libs) else (libs[0] if libs else lib_fixe)
                c.numeros.append(classer_numero(v, lib.lstrip('* ')))
        if not c.nom_affiche and c.societes:
            c.nom_affiche, c.est_societe = c.societes[0], True
        if c.nom_affiche or c.numeros or c.emails:
            contacts.append(c)
    return contacts


def lire_fichier(chemin: Path) -> list:
    if chemin.suffix.lower() in ('.vcf', '.vcard'):
        contacts = lire_vcard(chemin)
    elif chemin.suffix.lower() in ('.csv', '.txt'):
        contacts = lire_csv(chemin)
    else:
        raise SystemExit(f'Format non reconnu : {chemin.name} (attendu : .vcf ou .csv)')
    # Un fichier nommé d'après un groupe (« Dentistes.vcf », « Acheteurs.csv ») étiquette ses contacts.
    if not NOMS_FICHIERS_GENERIQUES.search(chemin.stem):
        for c in contacts:
            _ajouter(c.etiquettes, chemin.stem.replace('_', ' '))
    return contacts


# ---------------------------------------------------------------------------
# Fusion des doublons
# ---------------------------------------------------------------------------

MOTS_VIDES = {'me', 'dr', 'mr', 'mme', 'm', 'mlle', 'maitre', 'docteur', 'cabinet', 'et', 'de', 'du', 'la',
              'le', 'les', 'des', 'sas', 'sarl', 'sci', 'sa'}


def _mots_nom(c: Contact) -> set:
    texte = normaliser(' '.join((c.nom_affiche, c.prenom, c.nom)))
    return {m for m in re.findall(r'[a-z֐-׿]{2,}', texte) if m not in MOTS_VIDES}


def _noms_compatibles(a: Contact, b: Contact) -> bool:
    ma, mb = _mots_nom(a), _mots_nom(b)
    return not ma or not mb or bool(ma & mb)


def _cles(c: Contact) -> set:
    cles = set()
    for n in c.numeros:
        if n.e164:
            cles.add('t' + n.e164)
        for h in n.hypotheses:
            cles.add('t' + h.e164)
    for e in c.emails:
        cles.add('m' + e.lower())
    return cles


def _combiner(groupe: list) -> Contact:
    groupe = sorted(groupe, key=lambda c: -(len(c.numeros) + len(c.emails) + len(c.societes) + len(c.notes)))
    r = Contact()
    for c in groupe:
        r.prenom = r.prenom or c.prenom
        r.nom = r.nom or c.nom
        r.nom_affiche = r.nom_affiche or c.nom_affiche
        r.uid = r.uid or c.uid
        r.est_societe = r.est_societe or c.est_societe
        for attr in ('societes', 'fonctions', 'notes', 'emails', 'etiquettes', 'villes', 'pays', 'sources'):
            for v in getattr(c, attr):
                _ajouter(getattr(r, attr), v)
        r.numeros += c.numeros
    # dédoublonnage des numéros ; un numéro ambigu identique à un numéro sûr disparaît
    vus, numeros = set(), []
    for n in sorted(r.numeros, key=lambda n: n.pays == 'AMBIGU'):
        cle = n.e164 or re.sub(r'\D', '', n.brut)
        if cle in vus or any(h.e164 in vus for h in n.hypotheses):
            continue
        vus.add(cle)
        numeros.append(n)
    r.numeros = numeros
    return r


def fusionner(contacts: list) -> list:
    parent = list(range(len(contacts)))

    def racine(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    index = defaultdict(list)
    for i, c in enumerate(contacts):
        for cle in _cles(c):
            index[cle].append(i)
    for ids in index.values():
        for k, j in enumerate(ids[1:], start=1):
            for i in ids[:k]:
                if _noms_compatibles(contacts[i], contacts[j]):
                    parent[racine(j)] = racine(i)
                    break

    groupes = defaultdict(list)
    for i, c in enumerate(contacts):
        groupes[racine(i)].append(c)
    return [_combiner(g) for g in groupes.values()]


# ---------------------------------------------------------------------------
# Lever les ambiguïtés France / Israël grâce aux autres coordonnées du contact
# ---------------------------------------------------------------------------

def _indices_pays(c: Contact) -> Counter:
    score = Counter()
    for n in c.numeros:
        if n.pays in ('FR', 'IL') and n.certitude == 'sûr':
            score[n.pays] += 2
    for e in c.emails:
        dom = e.rpartition('@')[2]
        if dom.endswith('.fr'):
            score['FR'] += 1
        elif dom.endswith('.il') or dom in ('walla.com', 'bezeqint.net'):
            score['IL'] += 1
    for p in c.pays:
        p = normaliser(p)
        if 'france' in p:
            score['FR'] += 2
        elif 'israel' in p or 'ישראל' in p:
            score['IL'] += 2
    if re.search(r'[֐-׿]', c.nom_complet()):
        score['IL'] += 1
    return score


def lever_ambiguites(c: Contact):
    score = _indices_pays(c)
    for k, n in enumerate(c.numeros):
        if n.pays != 'AMBIGU':
            continue
        nfr, nil = n.hypotheses
        if score['FR'] > score['IL']:
            c.numeros[k] = replace(nfr, explication=n.explication + ' → France : autres coordonnées françaises')
        elif score['IL'] > score['FR']:
            c.numeros[k] = replace(nil, explication=n.explication + ' → Israël : autres coordonnées israéliennes')


# ---------------------------------------------------------------------------
# Catégories
# ---------------------------------------------------------------------------

def _texte_contact(c: Contact) -> str:
    morceaux = [c.nom_affiche, c.prenom, c.nom, *c.societes, *c.fonctions, *c.notes, *c.etiquettes]
    for e in c.emails:
        local, _, dom = e.partition('@')
        morceaux.append(re.sub(r'[._\-+]', ' ', local))
        if dom and dom not in MESSAGERIES:
            morceaux.append(re.sub(r'[.\-]', ' ', dom))
    return normaliser(' | '.join(m for m in morceaux if m))


def categoriser(c: Contact):
    texte = _texte_contact(c)
    trouvees = []
    for nom, segment, motifs in REGLES:
        for motif in motifs:
            m = re.search(motif, texte)
            if m:
                trouvees.append((nom, segment, m.group(0).strip()))
                break
        if nom.startswith('Maître') and TITRE_MAITRE.match(normaliser(c.nom_complet())):
            trouvees.append((nom, segment, 'Me'))
    societe = normaliser(' '.join(c.societes))
    forme = re.search(FORMES, societe) or re.search(FORMES, normaliser(c.nom_complet()))
    if forme and not any(t[0].startswith('Chef') for t in trouvees):
        trouvees.append(('Chef d’entreprise / dirigeant', 'B', forme.group(0)))

    if trouvees:
        ordre = [r[0] for r in REGLES]
        trouvees.sort(key=lambda t: ordre.index(t[0]))
        c.categorie, c.segment = trouvees[0][0], trouvees[0][1]
        # « Maître » + un indice d'avocat ou de notaire : on garde la profession précise.
        c.indices = [f'{t[0]} ({t[2]})' for t in trouvees]
    elif c.societes or c.est_societe:
        c.categorie, c.segment, c.indices = 'Contact professionnel (à préciser)', 'B', ['société renseignée']
    else:
        c.categorie, c.segment, c.indices = 'Ami / connaissance (à classer)', 'C', []


# ---------------------------------------------------------------------------
# Messages et liens
# ---------------------------------------------------------------------------

def prenom_pour_message(c: Contact) -> str:
    if c.est_societe and not c.prenom:
        return ''
    prenom = c.prenom or (c.nom_affiche.split()[0] if c.nom_affiche and not c.societes else '')
    if normaliser(prenom).strip('.') in MOTS_VIDES:
        return ''
    return prenom.strip()


def _choix(options: list, graine: str, decalage: int = 0):
    """Choix stable (toujours le même pour un contact donné) mais variable d'un contact à l'autre."""
    return options[(sum(map(ord, graine)) + decalage) % len(options)]


def forme_pour(c: Contact, tutoyer: set) -> str:
    return 'tu' if SEGMENTS[c.segment][0] in tutoyer else 'vous'


def message_pour(c: Contact, site: str, tutoyer: set, signature: str) -> str:
    seg = SEGMENTS[c.segment][0]
    if seg == '4':
        return ''
    forme = forme_pour(c, tutoyer)
    prenom = prenom_pour_message(c)
    graine = normaliser(c.nom_complet())
    salut = ('Salut' if forme == 'tu' else 'Bonjour') + (f' {prenom}' if prenom else '')
    if c.categorie in DEMANDES:
        demande = DEMANDES[c.categorie][forme]
    else:
        demande = DEMANDES['A' if c.segment == 'A' else 'defaut'][forme]
    societe = c.societes[0] if c.societes else ('ta société' if forme == 'tu' else 'votre société')
    texte = ' '.join([
        f'{salut}, {_choix(ACCROCHES[forme], graine)} !' if forme == 'tu' else f'{salut}, {_choix(ACCROCHES[forme], graine)}.',
        _choix(PRESENTATIONS, graine, 1).format(site=site),
        demande.format(societe=societe),
        _choix(CLOTURES[forme], graine, 2),
    ])
    return texte + (f'\n{signature}' if signature else '')


def lien_whatsapp(n: Numero, message: str) -> str:
    return f'https://wa.me/{n.e164.lstrip("+")}?text={quote(message)}' if n.mobile and n.e164 else ''


def lien_sms(n: Numero, message: str) -> str:
    return f'sms:{n.e164}&body={quote(message)}' if n.mobile and n.e164 else ''


# ---------------------------------------------------------------------------
# Classeur Excel
# ---------------------------------------------------------------------------

def _numero_principal(c: Contact):
    fr = [n for n in c.numeros if n.pays == 'FR']
    return sorted(fr, key=lambda n: (not n.mobile, n.certitude != 'sûr'))[0] if fr else None


def _autres(c: Contact, sauf=None) -> str:
    return ' ; '.join(
        f'{n.affichage} ({n.region or PAYS_LIBELLE.get(n.pays, n.pays)}{", " + n.libelle if n.libelle else ""})'
        for n in c.numeros if n is not sauf)


def ecrire_excel(contacts: list, sortie: Path, stats: dict, site: str, tutoyer: set, signature: str):
    try:
        from openpyxl import Workbook
        from openpyxl.styles import Alignment, Font, PatternFill
        from openpyxl.worksheet.datavalidation import DataValidation
    except ImportError:
        raise SystemExit('Il manque openpyxl : lancez « pip install openpyxl » puis recommencez.')

    bleu = PatternFill('solid', fgColor='1F3A93')
    couleurs = {'A': 'DCE6F7', 'B': 'E8F3E8', 'C': 'FFF6DB', 'X': 'EEEEEE'}
    lien = Font(color='1F3A93', underline='single')

    def feuille(wb, titre, colonnes, largeurs):
        ws = wb.create_sheet(titre)
        ws.append(colonnes)
        for cell in ws[1]:
            cell.font, cell.fill = Font(bold=True, color='FFFFFF'), bleu
            cell.alignment = Alignment(vertical='center', wrap_text=True)
        for k, w in enumerate(largeurs, start=1):
            ws.column_dimensions[ws.cell(1, k).column_letter].width = w
        ws.freeze_panes = 'A2'
        return ws

    def finir(ws):
        if ws.max_row > 1:
            ws.auto_filter.ref = ws.dimensions

    wb = Workbook()
    wb.remove(wb.active)
    ordre_seg = {'A': 0, 'B': 1, 'C': 2, 'X': 3}
    ordre_cat = {r[0]: k for k, r in enumerate(REGLES)}

    france = sorted((c for c in contacts if _numero_principal(c)),
                    key=lambda c: (ordre_seg[c.segment], ordre_cat.get(c.categorie, 99),
                                   normaliser(c.nom or c.nom_complet())))
    ws = feuille(wb, 'À contacter (France)', [
        'Segment', 'Catégorie', 'Prénom', 'Nom', 'Société', 'Fonction', 'Téléphone', 'Mobile', 'Certitude',
        'Autres numéros', 'E-mail', 'Ville', 'Groupes / étiquettes', 'Indices', 'Source', 'Notes',
        'Message proposé', 'WhatsApp', 'SMS (iPhone)', 'Statut', 'Date d’envoi', 'Comptable recommandé',
        'Coordonnées du comptable', 'Commentaire'],
        [17, 26, 14, 18, 22, 18, 19, 8, 10, 30, 26, 14, 20, 28, 18, 30, 60, 12, 12, 20, 12, 22, 24, 30])
    statut = DataValidation(type='list', formula1='"' + ','.join(STATUTS) + '"', allow_blank=True)
    ws.add_data_validation(statut)
    for c in france:
        n = _numero_principal(c)
        msg = message_pour(c, site, tutoyer, signature)
        prenom = c.prenom or ('' if c.est_societe else (c.nom_affiche.split()[0] if c.nom_affiche else ''))
        nom = c.nom or ('' if prenom else c.nom_complet())
        if not c.prenom and not c.nom:
            prenom, nom = '', c.nom_complet()
        ws.append([
            SEGMENTS[c.segment], c.categorie, prenom, nom, ' / '.join(c.societes), ' / '.join(c.fonctions),
            n.affichage, 'oui' if n.mobile else 'fixe', n.certitude, _autres(c, n), ', '.join(c.emails),
            ', '.join(c.villes), ', '.join(c.etiquettes), ' ; '.join(c.indices), ' + '.join(c.sources),
            ' | '.join(c.notes)[:300], msg, '', '', 'À contacter' if c.segment != 'X' else 'Pas intéressé',
        ])
        r = ws.max_row
        ws.cell(r, 1).fill = PatternFill('solid', fgColor=couleurs[c.segment])
        ws.cell(r, 17).alignment = Alignment(wrap_text=True, vertical='top')
        wa, sms = lien_whatsapp(n, msg), lien_sms(n, msg)
        if msg and wa:
            ws.cell(r, 18).value, ws.cell(r, 18).hyperlink, ws.cell(r, 18).font = 'Ouvrir', wa, lien
            ws.cell(r, 19).value, ws.cell(r, 19).hyperlink, ws.cell(r, 19).font = 'Ouvrir', sms, lien
        elif msg:
            ws.cell(r, 18).value = 'fixe : appeler'
        statut.add(ws.cell(r, 20))
    finir(ws)

    verifier = [c for c in contacts if not _numero_principal(c)
                and any(n.pays in ('AMBIGU', 'INCONNU') for n in c.numeros)]
    ws = feuille(wb, 'À vérifier', [
        'Nom', 'Société', 'Catégorie', 'Numéro tel que saisi', 'Si France', 'Si Israël', 'Pourquoi',
        'Autres numéros', 'E-mail', 'Source', 'Décision (France / Israël / ignorer)'],
        [26, 22, 26, 20, 20, 20, 40, 30, 26, 18, 18])
    decision = DataValidation(type='list', formula1='"France,Israël,Ignorer"', allow_blank=True)
    ws.add_data_validation(decision)
    for c in sorted(verifier, key=lambda c: (ordre_seg[c.segment], normaliser(c.nom_complet()))):
        for n in c.numeros:
            if n.pays not in ('AMBIGU', 'INCONNU'):
                continue
            nfr, nil = n.hypotheses or (None, None)
            ws.append([c.nom_complet(), ' / '.join(c.societes), c.categorie, n.brut,
                       nfr.affichage if nfr else '', nil.affichage if nil else '', n.explication,
                       _autres(c, n), ', '.join(c.emails), ' + '.join(c.sources)])
            decision.add(ws.cell(ws.max_row, 11))
    finir(ws)

    hors = [c for c in contacts if not _numero_principal(c) and c not in verifier and c.numeros]
    ws = feuille(wb, 'Israël et autres pays', [
        'Nom', 'Société', 'Catégorie', 'Numéro', 'Pays', 'E-mail', 'Source'], [26, 22, 26, 22, 20, 26, 18])
    for c in sorted(hors, key=lambda c: (ordre_seg[c.segment], normaliser(c.nom_complet()))):
        n = c.numeros[0]
        ws.append([c.nom_complet(), ' / '.join(c.societes), c.categorie, _autres(c),
                   n.region or PAYS_LIBELLE.get(n.pays, n.pays), ', '.join(c.emails), ' + '.join(c.sources)])
    finir(ws)

    sans = [c for c in contacts if not c.numeros and c.emails]
    ws = feuille(wb, 'Sans téléphone (e-mail)', [
        'Segment', 'Catégorie', 'Nom', 'Société', 'E-mail', 'Indices', 'Source'], [17, 26, 26, 22, 30, 28, 18])
    for c in sorted(sans, key=lambda c: (ordre_seg[c.segment], normaliser(c.nom_complet()))):
        ws.append([SEGMENTS[c.segment], c.categorie, c.nom_complet(), ' / '.join(c.societes),
                   ', '.join(c.emails), ' ; '.join(c.indices), ' + '.join(c.sources)])
    finir(ws)

    ws = wb.create_sheet('Synthèse', 0)
    ws.column_dimensions['A'].width, ws.column_dimensions['B'].width = 52, 12
    titre = Font(bold=True, size=13, color='1F3A93')
    lignes = [('Tri des contacts — synthèse', None)]
    lignes += [('Fichiers lus', None)] + [(f'  {nom}', nb) for nom, nb in stats['fichiers'].items()]
    lignes += [
        ('Fiches lues au total', stats['fiches']),
        ('Contacts après fusion des doublons', len(contacts)),
        ('', None),
        ('Avec au moins un numéro français', len(france)),
        ('  dont avec un mobile français (WhatsApp / SMS)', sum(1 for c in france if _numero_principal(c).mobile)),
        ('À vérifier (France ou Israël ?)', len(verifier)),
        ('Israël et autres pays uniquement', len(hors)),
        ('Sans téléphone mais avec un e-mail', len(sans)),
        ('', None),
        ('Contacts français par segment', None),
    ]
    lignes += [(f'  {SEGMENTS[s]}', sum(1 for c in france if c.segment == s)) for s in 'ABCX']
    lignes += [('', None), ('Contacts français par catégorie', None)]
    lignes += [(f'  {cat}', nb) for cat, nb in Counter(c.categorie for c in france).most_common()]
    for libelle, valeur in lignes:
        ws.append([libelle, valeur])
        if valeur is None and libelle:
            ws.cell(ws.max_row, 1).font = titre

    ws = wb.create_sheet('Mode d’emploi', 1)
    ws.column_dimensions['A'].width = 110
    for texte in [
        'Comment utiliser ce fichier',
        '1. Onglet « À contacter (France) » : vérifiez la catégorie proposée (colonne B) et corrigez-la si besoin.',
        '2. Commencez par le segment 1 (cibles directes), puis 2 (prescripteurs), puis 3 (réseau personnel).',
        '3. Sur l’iPhone, ouvrez ce fichier puis touchez « Ouvrir » (WhatsApp ou SMS) : le message est pré-rempli.',
        '   Personnalisez-le en une phrase avant d’envoyer (un souvenir commun, une nouvelle de la famille…).',
        '4. Notez le statut (colonne T) et la date d’envoi. Relance unique et courtoise après 5 à 7 jours.',
        '5. Quand quelqu’un vous donne le nom de son comptable, notez-le en colonnes V et W, puis appelez de sa part.',
        '6. Onglet « À vérifier » : numéros en 05 ou 07 sans indicatif, qui peuvent être français ou israéliens.',
        '',
        'Bonnes pratiques',
        '• Envoyez les messages un par un, pas en liste de diffusion : c’est plus efficace et plus respectueux.',
        '• Maximum 15 à 20 messages par jour pour pouvoir répondre à chacun le jour même.',
        '• Si quelqu’un ne souhaite pas être recontacté, passez son statut à « Pas intéressé » et n’insistez pas.',
        '• Ce fichier contient des données personnelles : ne le partagez pas et ne le déposez pas sur GitHub.',
    ]:
        ws.append([texte])
        if texte and not texte[0] in '0123456789• ':
            ws.cell(ws.max_row, 1).font = titre

    sortie.parent.mkdir(parents=True, exist_ok=True)
    wb.save(sortie)
    return {'france': len(france), 'verifier': len(verifier), 'hors': len(hors), 'sans': len(sans)}


# ---------------------------------------------------------------------------

def traiter(fichiers: list, sortie: Path, site: str = 'comptoirlegal.fr', tutoyer: set = frozenset('23'),
            signature: str = '') -> dict:
    tous, stats = [], {'fichiers': {}, 'fiches': 0}
    for f in fichiers:
        contacts = lire_fichier(Path(f))
        stats['fichiers'][Path(f).name] = len(contacts)
        stats['fiches'] += len(contacts)
        tous += contacts
    contacts = fusionner(tous)
    for c in contacts:
        lever_ambiguites(c)
        categoriser(c)
    resultat = ecrire_excel(contacts, sortie, stats, site, set(tutoyer), signature)
    resultat.update(fiches=stats['fiches'], contacts=len(contacts))
    return resultat


def main(argv=None):
    p = argparse.ArgumentParser(description='Trie les contacts iCloud / Google pour la prospection.')
    p.add_argument('fichiers', nargs='+', help='fichiers .vcf (iCloud) et/ou .csv (Google)')
    p.add_argument('-o', '--sortie', help='classeur Excel produit (par défaut : contacts_tries.xlsx à côté du 1er fichier)')
    p.add_argument('--site', default='comptoirlegal.fr', help='adresse du site citée dans les messages')
    p.add_argument('--tutoyer', default='23', help='segments à tutoyer : « 23 » (défaut), « 123 », « » pour vouvoyer tout le monde')
    p.add_argument('--signature', default='', help='signature ajoutée à la fin des messages (ex. « Paul »)')
    a = p.parse_args(argv)
    sortie = Path(a.sortie) if a.sortie else Path(a.fichiers[0]).with_name('contacts_tries.xlsx')
    r = traiter(a.fichiers, sortie, a.site, set(a.tutoyer), a.signature)
    print(f"{r['fiches']} fiches lues → {r['contacts']} contacts après fusion des doublons")
    print(f"  {r['france']} avec un numéro français · {r['verifier']} à vérifier · "
          f"{r['hors']} Israël / autres pays · {r['sans']} sans téléphone")
    print(f'Classeur créé : {sortie}')


if __name__ == '__main__':
    main()
