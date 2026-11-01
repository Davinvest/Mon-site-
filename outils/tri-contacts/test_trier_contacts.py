"""Tests du tri des contacts — données 100 % fictives.

Les numéros français utilisent les plages réservées à la fiction par l'ARCEP
(01 99 00…, 05 36 49…, 06 39 98…). Lancer : python3 -m unittest -v
"""

import tempfile
import unittest
from pathlib import Path

from openpyxl import load_workbook

import trier_contacts as tc

VCARD = """BEGIN:VCARD
VERSION:3.0
N:Martin;Paul;;;
FN:Paul Martin
ORG:Cabinet Martin Expertise Comptable;
item1.TEL;type=pref:+33 6 39 98 00 01
item1.X-ABLabel:_$!<Mobile>!$_
EMAIL;type=INTERNET:paul.martin@exemple-compta.fr
UID:aaaa-1111
NOTE:Rencontré au salon\\, très sympa
END:VCARD
BEGIN:VCARD
VERSION:3.0
N:Durand;Sophie;;Me;
FN:Me Sophie Durand
TEL;type=CELL;type=VOICE:06 39 98 00 02
EMAIL:sophie.durand@notaires.fr
UID:bbbb-2222
END:VCARD
BEGIN:VCARD
VERSION:3.0
N:Lévy;David;;;
FN:David Lévy
TITLE:Chirurgien-dentiste
TEL;type=CELL:+33 (0)6 39 98 00 03
UID:cccc-3333
END:VCARD
BEGIN:VCARD
VERSION:3.0
N:Cohen;Avi;;;
FN:Avi Cohen
TEL;type=CELL:052-123-4567
UID:dddd-4444
END:VCARD
BEGIN:VCARD
VERSION:3.0
N:;Maman;;;
FN:Maman
TEL;type=CELL:0639980004
UID:eeee-5555
END:VCARD
BEGIN:VCARD
VERSION:3.0
N:Benhamou;André;;;
FN:André Benhamou
TEL;type=CELL:0536490001
EMAIL:andre.b@exemple.co.il
UID:ffff-6666
END:VCARD
BEGIN:VCARD
VERSION:3.0
N:Azoulay;Rachel;;;
FN:Rachel Azoulay
TEL;type=CELL:0536490002
UID:gggg-7777
END:VCARD
BEGIN:VCARD
VERSION:3.0
FN:Acheteurs Résidence Les Pins
X-ADDRESSBOOKSERVER-KIND:group
X-ADDRESSBOOKSERVER-MEMBER:urn:uuid:gggg-7777
END:VCARD
"""

VCARD_21 = """BEGIN:VCARD
VERSION:2.1
N;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:Ga=C3=ABl;Fran=C3=A7ois;;;
FN;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:Fran=C3=A7ois Ga=C3=ABl
TEL;CELL:+33639980009
END:VCARD
"""

CSV_GOOGLE = (
    "First Name,Middle Name,Last Name,Organization Name,Organization Title,Notes,Labels,"
    "E-mail 1 - Label,E-mail 1 - Value,Phone 1 - Label,Phone 1 - Value,Phone 2 - Label,Phone 2 - Value\n"
    "Paul,,Martin,,,,* myContacts,Work,paul.martin@exemple-compta.fr,Mobile,06 39 98 00 01,,\n"
    "Julie,,Bernard,Bernard Plomberie SARL,Gérante,,* myContacts ::: Clients,,,"
    "Mobile,+33 6 39 98 00 05 ::: 01 99 00 00 06,,\n"
    "Marc,,Petit,Cabinet Petit,,,* myContacts,,,Work,01 99 00 00 07,,\n"
    "Luc,,Roux,Cabinet Petit,,,* myContacts,,,Work,01 99 00 00 07,,\n"
    "Service,,Client,,,,* myContacts,,,,3615,,\n"
)


class TestNumeros(unittest.TestCase):
    def verifier(self, brut, pays, e164='', certitude=None):
        n = tc.classer_numero(brut)
        self.assertEqual(n.pays, pays, f'{brut} → {n}')
        if e164:
            self.assertEqual(n.e164, e164)
        if certitude:
            self.assertEqual(n.certitude, certitude)
        return n

    def test_france(self):
        self.assertTrue(self.verifier('+33 6 39 98 00 01', 'FR', '+33639980001', 'sûr').mobile)
        self.verifier('06 39 98 00 02', 'FR', '+33639980002', 'sûr')
        self.assertFalse(self.verifier('0033 1 99 00 00 01', 'FR', '+33199000001').mobile)
        self.verifier('+33 (0)6 39 98 00 03', 'FR', '+33639980003')
        self.verifier('+33 06 39 98 00 03', 'FR', '+33639980003')
        self.verifier('33639980003', 'FR', '+33639980003', 'probable')
        self.verifier('639980004', 'FR', '+33639980004', 'probable')       # zéro perdu par Excel
        self.verifier('05 36 49 00 01', 'FR', '+33536490001', 'probable')  # écrit par paires
        self.verifier('‪+33 6 39 98 00 01‬', 'FR', '+33639980001')

    def test_outre_mer(self):
        n = self.verifier('+262 692 00 00 00', 'FR', '+262692000000')
        self.assertEqual(n.region, 'La Réunion / Mayotte')
        self.assertTrue(n.mobile)

    def test_israel(self):
        self.assertTrue(self.verifier('+972 52-123-4567', 'IL', '+972521234567', 'sûr').mobile)
        self.verifier('+972 052-123-4567', 'IL', '+972521234567')
        self.verifier('052-123-4567', 'IL', '+972521234567', 'probable')
        self.verifier('03-1234567', 'IL', '+97231234567', 'sûr')
        self.assertEqual(tc.classer_numero('+972 52-123-4567').affichage, '+972 52-123-4567')

    def test_ambigus(self):
        n = self.verifier('0536490001', 'AMBIGU')
        self.assertEqual([h.e164 for h in n.hypotheses], ['+33536490001', '+972536490001'])
        self.verifier('0771234567', 'AMBIGU')
        self.verifier('536490001', 'AMBIGU')

    def test_autres(self):
        self.assertEqual(self.verifier('+1 212 555 0100', 'AUTRE').region, 'États-Unis / Canada')
        self.assertEqual(self.verifier('+32 2 123 45 67', 'AUTRE').region, 'Belgique')
        self.verifier('3615', 'INCONNU')
        self.verifier('', 'INCONNU')


class TestLecture(unittest.TestCase):
    def setUp(self):
        self.dossier = Path(tempfile.mkdtemp())

    def ecrire(self, nom, texte):
        chemin = self.dossier / nom
        chemin.write_text(texte, encoding='utf-8')
        return chemin

    def test_vcard(self):
        contacts = tc.lire_vcard(self.ecrire('iCloud.vcf', VCARD))
        self.assertEqual(len(contacts), 7)                     # la fiche « groupe » n'est pas un contact
        paul = contacts[0]
        self.assertEqual((paul.prenom, paul.nom), ('Paul', 'Martin'))
        self.assertEqual(paul.numeros[0].libelle, 'Mobile')
        self.assertEqual(paul.notes, ['Rencontré au salon, très sympa'])
        rachel = next(c for c in contacts if c.nom == 'Azoulay')
        self.assertIn('Acheteurs Résidence Les Pins', rachel.etiquettes)

    def test_vcard_21_quoted_printable(self):
        c = tc.lire_vcard(self.ecrire('android.vcf', VCARD_21))[0]
        self.assertEqual((c.prenom, c.nom), ('François', 'Gaël'))

    def test_csv_google(self):
        contacts = tc.lire_csv(self.ecrire('contacts.csv', CSV_GOOGLE))
        julie = next(c for c in contacts if c.prenom == 'Julie')
        self.assertEqual([n.e164 for n in julie.numeros], ['+33639980005', '+33199000006'])
        self.assertEqual(julie.etiquettes, ['Clients'])
        self.assertEqual(julie.societes, ['Bernard Plomberie SARL'])

    def test_nom_de_fichier_devient_etiquette(self):
        contacts = tc.lire_fichier(self.ecrire('Dentistes.vcf', VCARD_21))
        self.assertIn('Dentistes', contacts[0].etiquettes)
        contacts = tc.lire_fichier(self.ecrire('Export iCloud.vcf', VCARD_21))
        self.assertEqual(contacts[0].etiquettes, [])


class TestTri(unittest.TestCase):
    def setUp(self):
        dossier = Path(tempfile.mkdtemp())
        (dossier / 'iCloud.vcf').write_text(VCARD, encoding='utf-8')
        (dossier / 'contacts.csv').write_text(CSV_GOOGLE, encoding='utf-8')
        self.contacts = tc.fusionner(tc.lire_vcard(dossier / 'iCloud.vcf') + tc.lire_csv(dossier / 'contacts.csv'))
        for c in self.contacts:
            tc.lever_ambiguites(c)
            tc.categoriser(c)

    def trouver(self, nom):
        return next(c for c in self.contacts if nom in c.nom_complet())

    def test_doublon_icloud_google_fusionne(self):
        paul = [c for c in self.contacts if c.nom == 'Martin']
        self.assertEqual(len(paul), 1)
        self.assertEqual(len(paul[0].sources), 2)
        self.assertEqual(len(paul[0].numeros), 1)

    def test_standard_partage_ne_fusionne_pas(self):
        self.assertEqual(len([c for c in self.contacts if c.societes == ['Cabinet Petit']]), 2)

    def test_categories(self):
        self.assertEqual(self.trouver('Paul Martin').categorie, 'Expert-comptable')
        self.assertEqual(self.trouver('Sophie Durand').categorie, 'Notaire')
        self.assertEqual(self.trouver('David Lévy').categorie, 'Santé (dentiste, médecin…)')
        self.assertEqual(self.trouver('Maman').categorie, 'Famille')
        self.assertEqual(self.trouver('Julie Bernard').categorie, 'Ancien client / acquéreur')
        self.assertEqual(self.trouver('Rachel Azoulay').categorie, 'Ancien client / acquéreur')
        self.assertEqual(self.trouver('Marc Petit').categorie, 'Contact professionnel (à préciser)')
        self.assertEqual(self.trouver('Service Client').segment, 'X')
        # « André » ne doit pas être pris pour « Dr »
        self.assertNotEqual(self.trouver('André Benhamou').categorie, 'Santé (dentiste, médecin…)')

    def test_maitre(self):
        c = tc.Contact(nom_affiche='Me Alain Roche', prenom='Alain', nom='Roche')
        tc.categoriser(c)
        self.assertEqual(c.categorie, 'Maître (avocat ou notaire, à préciser)')
        self.assertEqual(c.segment, 'A')

    def test_ambiguite_levee_par_le_contexte(self):
        andre = self.trouver('André Benhamou')                 # e-mail en .co.il
        self.assertEqual(andre.numeros[0].pays, 'IL')
        rachel = self.trouver('Rachel Azoulay')                # aucun indice
        self.assertEqual(rachel.numeros[0].pays, 'AMBIGU')

    def test_messages(self):
        tutoyer = {'2', '3'}
        notaire = tc.message_pour(self.trouver('Sophie Durand'), 'comptoirlegal.fr', tutoyer, '')
        self.assertTrue(notaire.startswith('Bonjour Sophie,'))
        self.assertIn('régime matrimonial', notaire)
        maman = tc.message_pour(self.trouver('Maman'), 'comptoirlegal.fr', tutoyer, 'Paul')
        self.assertTrue(maman.startswith('Salut Maman,'))
        self.assertTrue(maman.endswith('\nPaul'))
        julie = tc.message_pour(self.trouver('Julie Bernard'), 'comptoirlegal.fr', tutoyer, '')
        self.assertIn('ton expert-comptable', julie)
        dirigeant = tc.Contact(prenom='Léa', nom='Simon', societes=['Simon Conseil SAS'], fonctions=['Présidente'])
        tc.categoriser(dirigeant)
        self.assertIn('Pour Simon Conseil SAS', tc.message_pour(dirigeant, 'comptoirlegal.fr', tutoyer, ''))
        self.assertEqual(tc.message_pour(self.trouver('Service Client'), 'x', tutoyer, ''), '')

    def test_messages_varient(self):
        textes = set()
        for prenom in ('Anne', 'Bruno', 'Chloé', 'Denis', 'Emma', 'Farid', 'Gil'):
            c = tc.Contact(prenom=prenom, nom='Test')
            tc.categoriser(c)
            textes.add(tc.message_pour(c, 'comptoirlegal.fr', {'3'}, '').replace(prenom, ''))
        self.assertGreater(len(textes), 2)


class TestClasseur(unittest.TestCase):
    def test_bout_en_bout(self):
        dossier = Path(tempfile.mkdtemp())
        (dossier / 'iCloud.vcf').write_text(VCARD, encoding='utf-8')
        (dossier / 'contacts.csv').write_text(CSV_GOOGLE, encoding='utf-8')
        sortie = dossier / 'resultat.xlsx'
        r = tc.traiter([dossier / 'iCloud.vcf', dossier / 'contacts.csv'], sortie)
        self.assertEqual(r['fiches'], 12)
        wb = load_workbook(sortie)
        self.assertEqual(wb.sheetnames[:2], ['Synthèse', 'Mode d’emploi'])
        ws = wb['À contacter (France)']
        lignes = {ws.cell(i, 4).value: i for i in range(2, ws.max_row + 1)}
        self.assertEqual(ws.cell(2, 2).value, 'Notaire')       # les cibles directes d'abord
        paul = lignes['Martin']
        self.assertTrue(ws.cell(paul, 18).hyperlink.target.startswith('https://wa.me/33639980001?text='))
        petit = lignes['Petit']
        self.assertEqual(ws.cell(petit, 18).value, 'fixe : appeler')
        self.assertEqual(wb['À vérifier'].cell(2, 1).value, 'Rachel Azoulay')
        self.assertEqual(wb['Israël et autres pays'].max_row, 3)  # Avi Cohen + André Benhamou


if __name__ == '__main__':
    unittest.main()
