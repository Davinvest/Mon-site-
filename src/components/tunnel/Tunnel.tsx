'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { CoupureJournal, titreAvis } from '@/components/CoupureJournal'
import { CATEGORIES, TYPES_ANNONCE, trouverType } from '@/data/annonces'
import type { TypeAnnonce } from '@/data/annonces'
import { DEPARTEMENTS, departementDuCodePostal } from '@/data/departements'
import { MODELES } from '@/data/modeles'
import type { Modele, Saisie } from '@/data/modeles'
import { bornesParution } from '@/lib/commande'
import { calculerPrix, euros, normaliserTexte, prixAffiche } from '@/lib/prix'
import { ChampFormulaire } from './ChampFormulaire'

const ETAPES = ['Démarche', 'Type', 'Rédaction', 'Parution', 'Paiement']
const CLE_BROUILLON = 'comptoirlegal-brouillon-v2'
const FILTRES = ['Tous', ...Array.from(new Set(CATEGORIES.map((c) => c.filtre)))]

interface Client {
  prenom: string
  nom: string
  email: string
  telephone: string
  societe: string
}

interface Brouillon {
  typeSlug: string
  saisie: Saisie
  texteEdite: string | null
  dateParution: string
  client: Client
}

const CLIENT_VIDE: Client = { prenom: '', nom: '', email: '', telephone: '', societe: '' }

function saisieInitiale(type: TypeAnnonce | undefined, modele: Modele | undefined): Saisie {
  const champs: Record<string, string> = {}
  if (type?.forme) champs.forme = type.forme
  if (modele?.groupes.some((g) => g.champs.some((c) => c.nom === 'acte_nature'))) champs.acte_nature = 'Acte sous seing privé'
  const listes: Saisie['listes'] = {}
  for (const r of modele?.repetables ?? []) listes[r.nom] = Array.from({ length: Math.max(r.min, 1) }, () => ({}))
  return { champs, listes }
}

/** Champ qui porte le code postal du département de publication. */
function champCodePostal(type: TypeAnnonce, modele: Modele): string {
  return type.variante === 'nouveau-siege' ? 'nouveau_cp' : modele.champCodePostal
}

function lireBrouillon(): Brouillon | null {
  try {
    const brut = localStorage.getItem(CLE_BROUILLON)
    return brut ? (JSON.parse(brut) as Brouillon) : null
  } catch {
    return null
  }
}

function dateLisible(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

export function Tunnel({ typeInitial, annule }: { typeInitial?: string; annule?: boolean }) {
  const typeDepart = typeInitial ? trouverType(typeInitial) : undefined
  const [etape, setEtape] = useState(typeDepart ? 3 : 1)
  const [typeSlug, setTypeSlug] = useState(typeDepart?.slug ?? '')
  const [saisie, setSaisie] = useState<Saisie>(() => saisieInitiale(typeDepart, typeDepart && MODELES[typeDepart.modele]))
  const [texteEdite, setTexteEdite] = useState<string | null>(null)
  const [dateParution, setDateParution] = useState('')
  const [client, setClient] = useState<Client>(CLIENT_VIDE)
  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState('Tous')
  const [erreurs, setErreurs] = useState<string[]>([])
  const [accepteCgv, setAccepteCgv] = useState(false)
  const [accepteExecution, setAccepteExecution] = useState(false)
  const [envoi, setEnvoi] = useState(false)
  const [erreurPaiement, setErreurPaiement] = useState('')
  const [brouillonCharge, setBrouillonCharge] = useState(false)

  // Reprise du brouillon enregistré dans ce navigateur (même type d'annonce)
  useEffect(() => {
    const b = lireBrouillon()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture unique du stockage local au montage
    setBrouillonCharge(true)
    if (!b || !trouverType(b.typeSlug)) return
    if (typeDepart && b.typeSlug !== typeDepart.slug) return
    setTypeSlug(b.typeSlug)
    setSaisie(b.saisie)
    setTexteEdite(b.texteEdite)
    setDateParution(b.dateParution ?? '')
    setClient({ ...CLIENT_VIDE, ...b.client })
    if (!typeDepart && b.typeSlug) setEtape(3)
  }, [typeDepart])

  useEffect(() => {
    if (!brouillonCharge || !typeSlug) return
    try {
      localStorage.setItem(CLE_BROUILLON, JSON.stringify({ typeSlug, saisie, texteEdite, dateParution, client } satisfies Brouillon))
    } catch {
      // stockage indisponible : le parcours fonctionne sans brouillon
    }
  }, [brouillonCharge, typeSlug, saisie, texteEdite, dateParution, client])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [etape])

  const type = trouverType(typeSlug)
  const modele = type ? MODELES[type.modele] : undefined

  const texteGenere = useMemo(
    () => (type && modele ? normaliserTexte(modele.rediger(saisie, { forme: type.forme, variante: type.variante })) : ''),
    [type, modele, saisie],
  )
  const texte = texteEdite ?? texteGenere
  const codePostal = type && modele ? (saisie.champs[champCodePostal(type, modele)] ?? '').trim() : ''
  const departement = departementDuCodePostal(codePostal)
  const prix = type && departement ? calculerPrix(type, departement, texte) : null
  const lieu = departement ? `${DEPARTEMENTS[departement]} (${departement})` : 'Journal habilité'

  const typesFiltres = useMemo(() => {
    const q = recherche.trim().toLowerCase()
    return TYPES_ANNONCE.filter((t) => {
      const cat = CATEGORIES.find((c) => c.slug === t.categorie)
      if (filtre !== 'Tous' && cat?.filtre !== filtre) return false
      return !q || `${t.titre} ${cat?.titre} ${t.forme ?? ''}`.toLowerCase().includes(q)
    })
  }, [recherche, filtre])

  function choisirType(t: TypeAnnonce) {
    if (t.slug !== typeSlug) {
      setSaisie(saisieInitiale(t, MODELES[t.modele]))
      setTexteEdite(null)
    }
    setTypeSlug(t.slug)
    setErreurs([])
    setEtape(3)
  }

  function majChamp(nom: string, valeur: string) {
    setSaisie((s) => ({ ...s, champs: { ...s.champs, [nom]: valeur } }))
  }

  function majListe(liste: string, index: number, nom: string, valeur: string) {
    setSaisie((s) => {
      const lignes = [...(s.listes[liste] ?? [])]
      lignes[index] = { ...lignes[index], [nom]: valeur }
      return { ...s, listes: { ...s.listes, [liste]: lignes } }
    })
  }

  function ajouterLigne(liste: string) {
    setSaisie((s) => ({ ...s, listes: { ...s.listes, [liste]: [...(s.listes[liste] ?? []), {}] } }))
  }

  function retirerLigne(liste: string, index: number) {
    setSaisie((s) => ({ ...s, listes: { ...s.listes, [liste]: (s.listes[liste] ?? []).filter((_, i) => i !== index) } }))
  }

  function verifierSaisie(): string[] {
    if (!type || !modele) return ['Choisissez un type d’annonce.']
    const manquants: string[] = []
    if (texteEdite === null) {
      for (const g of modele.groupes) {
        for (const c of g.champs) if (c.requis && !(saisie.champs[c.nom] ?? '').trim()) manquants.push(c.libelle)
      }
    }
    if (!departement) manquants.push('Code postal valide (il détermine le département de publication)')
    else if (!texte.includes(codePostal)) manquants.push('Le code postal de publication doit apparaître dans le texte')
    if (texte.length < 80) manquants.push('Texte de l’annonce (trop court)')
    return manquants
  }

  function versParution() {
    const manquants = verifierSaisie()
    setErreurs(manquants)
    if (manquants.length === 0) setEtape(4)
  }

  async function payer() {
    setErreurPaiement('')
    if (!type) return
    setEnvoi(true)
    try {
      const r = await fetch('/api/commande', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ typeSlug: type.slug, codePostal, texte, dateParution, client, accepteCgv, accepteExecution }),
      })
      const corps = await r.json()
      if (!r.ok || !corps.url) throw new Error(corps.erreur || 'Paiement indisponible.')
      try {
        localStorage.removeItem(CLE_BROUILLON)
      } catch {}
      window.location.assign(corps.url)
    } catch (e) {
      setErreurPaiement(e instanceof Error ? e.message : 'Paiement indisponible.')
      setEnvoi(false)
    }
  }

  const clientValide = client.prenom.trim() && client.nom.trim() && /\S+@\S+\.\S+/.test(client.email)
  const bornes = bornesParution()

  const recapitulatif = type && prix && departement && (
    <div className="carte carte-ombre recap">
      <p className="surtitre">Récapitulatif</p>
      <dl>
        <dt>Annonce</dt>
        <dd>{type.titre}</dd>
        <dt>Département</dt>
        <dd>{lieu}</dd>
        <dt>Parution</dt>
        <dd>{dateParution ? dateLisible(dateParution) : 'Dès que possible'}</dd>
        <dt>Tarification</dt>
        <dd>{prix.mode === 'forfait' ? 'Forfait réglementé' : `${prix.caracteres} caractères`}</dd>
        <dt>Attestation de parution</dt>
        <dd>Comprise</dd>
        <dt>Montant HT</dt>
        <dd>{euros(prix.ht)}</dd>
        <dt>TVA 20 %</dt>
        <dd>{euros(prix.tva)}</dd>
        <dt className="total">Total TTC</dt>
        <dd className="total">{euros(prix.ttc)}</dd>
      </dl>
      <details style={{ marginTop: 14 }}>
        <summary className="petit" style={{ cursor: 'pointer' }}>
          Relire l’avis
        </summary>
        <div style={{ marginTop: 10 }}>
          <CoupureJournal titre={titreAvis(type.modele)} texte={texte} lieu={lieu} />
        </div>
      </details>
    </div>
  )

  return (
    <div className="tunnel conteneur">
      <ol className="progression" aria-label="Étapes">
        {ETAPES.map((nom, i) => (
          <li key={nom} className={i + 1 < etape ? 'fait' : i + 1 === etape ? 'actuel' : ''} aria-current={i + 1 === etape ? 'step' : undefined}>
            {i + 1} · {nom}
          </li>
        ))}
      </ol>

      {annule && etape >= 3 && (
        <p className="alerte alerte-info">Le paiement a été annulé. Votre saisie est conservée, vous pouvez reprendre quand vous voulez.</p>
      )}

      {type && etape >= 3 && (
        <p className="petit muted">
          <strong style={{ color: 'var(--text)' }}>{type.titre}</strong> · {prixAffiche(type)}{' '}
          <button type="button" className="filtre" style={{ padding: '2px 10px' }} onClick={() => setEtape(2)}>
            changer
          </button>
        </p>
      )}

      {etape === 1 && (
        <section>
          <p className="surtitre">Étape 1 sur 5</p>
          <h1>
            Vous saisissez une fois. <em>Tout le reste suit.</em>
          </h1>
          <p className="chapo">Dites-nous ce que vous voulez faire : la suite s’adapte.</p>
          <div className="grille grille-2" style={{ marginTop: 24 }}>
            <button type="button" className="carte carte-lien choix-type" onClick={() => setEtape(2)}>
              <span className="badge">Sans compte · paiement en ligne</span>
              <strong style={{ fontSize: '1.4rem', marginTop: 6 }}>Publier une annonce légale</strong>
              <span className="muted">Constitution, modification, dissolution, cession… Journal habilité du département, au tarif fixé par l’État.</span>
            </button>
            <Link href="/formalites" className="carte carte-lien">
              <span className="badge badge-accent">Avec votre compte INPI</span>
              <strong style={{ fontSize: '1.4rem', marginTop: 6 }}>Préparer une formalité au guichet unique</strong>
              <span className="muted">Déposez vos pièces : le brouillon est pré-rempli sur votre compte INPI. Vous relisez et vous signez.</span>
            </Link>
          </div>
        </section>
      )}

      {etape === 2 && (
        <section>
          <p className="surtitre">Étape 2 sur 5</p>
          <h1>Quelle annonce devez-vous publier ?</h1>
          <div className="champ" style={{ maxWidth: 520, marginTop: 16 }}>
            <label htmlFor="recherche-type" className="sr-only">
              Rechercher un type d’annonce
            </label>
            <input
              id="recherche-type"
              type="search"
              placeholder="Rechercher (ex. SAS, transfert de siège, dissolution…)"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
          </div>
          <div className="filtres" role="group" aria-label="Filtrer par catégorie">
            {FILTRES.map((f) => (
              <button key={f} type="button" className="filtre" aria-pressed={filtre === f} onClick={() => setFiltre(f)}>
                {f}
              </button>
            ))}
          </div>
          <div className="grille grille-3">
            {typesFiltres.map((t) => (
              <button
                key={t.slug}
                type="button"
                className={`carte carte-lien choix-type${t.slug === typeSlug ? ' selectionne' : ''}`}
                onClick={() => choisirType(t)}
              >
                <span className="petit muted">{CATEGORIES.find((c) => c.slug === t.categorie)?.titre}</span>
                <strong>{t.titre}</strong>
                <span className="prix">{prixAffiche(t)}</span>
              </button>
            ))}
          </div>
          {typesFiltres.length === 0 && <p className="muted">Aucun résultat. Essayez un autre mot, ou écrivez-nous.</p>}
          <div className="actions">
            <button type="button" className="btn btn-secondaire" onClick={() => setEtape(1)}>
              ← Retour
            </button>
          </div>
        </section>
      )}

      {etape === 3 && type && modele && (
        <section>
          <p className="surtitre">Étape 3 sur 5</p>
          <h1>
            Remplissez. <em>L’avis s’écrit tout seul.</em>
          </h1>
          <p className="chapo">
            Gardez vos statuts ou votre procès-verbal sous la main : l’annonce doit reprendre exactement leurs mentions.
          </p>

          <div className="tunnel-verif" style={{ marginTop: 24 }}>
            <div>
              {texteEdite !== null && (
                <p className="alerte alerte-info">
                  Vous modifiez le texte directement : le formulaire ne met plus l’avis à jour.{' '}
                  <button type="button" className="filtre" onClick={() => setTexteEdite(null)}>
                    Revenir au texte du formulaire
                  </button>
                </p>
              )}
              {modele.groupes.map((g) =>
                g.champs.length === 0 ? null : (
                  <fieldset key={g.titre} className="groupe-form">
                    <legend>{g.titre}</legend>
                    <div className="grille-champs">
                      {g.champs.map((c) => (
                        <ChampFormulaire key={c.nom} champ={c} valeur={saisie.champs[c.nom] ?? ''} onChange={(v) => majChamp(c.nom, v)} id={`f-${c.nom}`} />
                      ))}
                    </div>
                  </fieldset>
                ),
              )}
              {modele.repetables?.map((r) => {
                const lignes = saisie.listes[r.nom] ?? []
                return (
                  <fieldset key={r.nom} className="groupe-form">
                    <legend>{r.titre}</legend>
                    {lignes.map((ligne, i) => (
                      <div key={i} className="repetable">
                        <div className="grille-champs">
                          {r.champs
                            .filter((c) =>
                              ligne.personne_morale === 'oui'
                                ? !['civilite', 'prenom', 'nom', 'adresse'].includes(c.nom)
                                : !c.nom.endsWith('_pm'),
                            )
                            .map((c) => (
                              <ChampFormulaire
                                key={c.nom}
                                champ={c}
                                valeur={ligne[c.nom] ?? ''}
                                onChange={(v) => majListe(r.nom, i, c.nom, v)}
                                id={`f-${r.nom}-${i}-${c.nom}`}
                              />
                            ))}
                        </div>
                        {lignes.length > r.min && (
                          <button type="button" className="filtre" onClick={() => retirerLigne(r.nom, i)}>
                            Retirer
                          </button>
                        )}
                      </div>
                    ))}
                    {lignes.length < r.max && (
                      <button type="button" className="btn btn-secondaire" onClick={() => ajouterLigne(r.nom)}>
                        + {r.libelleAjout}
                      </button>
                    )}
                  </fieldset>
                )
              })}
            </div>

            <aside className="colle">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <p className="surtitre" style={{ margin: 0 }}>
                  L’avis, tel qu’il paraîtra
                </p>
                {texteEdite === null && (
                  <button type="button" className="filtre" onClick={() => setTexteEdite(texteGenere)}>
                    Modifier le texte
                  </button>
                )}
              </div>
              {texteEdite === null ? (
                <div aria-live="polite">
                  <CoupureJournal titre={titreAvis(type.modele)} texte={texteGenere} lieu={lieu} />
                </div>
              ) : (
                <textarea className="apercu" aria-label="Texte de l’annonce" value={texteEdite} onChange={(e) => setTexteEdite(e.target.value)} />
              )}
              <div className="carte recap" style={{ marginTop: 16 }}>
                <dl>
                  <dt>Département</dt>
                  <dd>{departement ? lieu : 'selon le code postal'}</dd>
                  {prix?.mode === 'caractere' && (
                    <>
                      <dt>Longueur</dt>
                      <dd>
                        {prix.caracteres} car. × {prix.tarifCaractere?.toLocaleString('fr-FR')} €
                      </dd>
                    </>
                  )}
                  <dt>Prix HT</dt>
                  <dd>{prix ? euros(prix.ht) : prixAffiche(type)}</dd>
                  <dt className="total">Total TTC</dt>
                  <dd className="total">{prix ? euros(prix.ttc) : '—'}</dd>
                </dl>
                {erreurs.length > 0 && (
                  <div className="alerte alerte-erreur" role="alert">
                    À compléter :
                    <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                      {erreurs.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="actions" style={{ marginTop: 16 }}>
                  <button type="button" className="btn btn-secondaire" onClick={() => setEtape(2)}>
                    ← Retour
                  </button>
                  <button type="button" className="btn btn-primaire" onClick={versParution}>
                    Continuer
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </section>
      )}

      {etape === 4 && type && prix && departement && (
        <section className="tunnel-verif">
          <div>
            <p className="surtitre">Étape 4 sur 5</p>
            <h1>
              Le bon journal, <em>à la date que vous choisissez</em>.
            </h1>
            <fieldset className="groupe-form" style={{ marginTop: 16 }}>
              <legend>Le journal</legend>
              <p style={{ margin: 0 }}>
                <strong>Journal habilité · {lieu}</strong>
              </p>
              <p className="petit muted" style={{ margin: '6px 0 0' }}>
                L’habilitation à publier des annonces légales est accordée par département. Le vôtre est déduit du code postal {codePostal}{' '}
                figurant dans l’annonce : le support est sélectionné en conséquence.
              </p>
            </fieldset>
            <fieldset className="groupe-form">
              <legend>La date de parution</legend>
              <div className="champ" style={{ maxWidth: 280 }}>
                <label htmlFor="date-parution">Date souhaitée (facultatif)</label>
                <input
                  id="date-parution"
                  type="date"
                  min={bornes.min}
                  max={bornes.max}
                  value={dateParution}
                  onChange={(e) => setDateParution(e.target.value)}
                />
                <span className="aide">Laissez vide : votre annonce paraît dès que possible.</span>
              </div>
            </fieldset>
            <div className="actions">
              <button type="button" className="btn btn-secondaire" onClick={() => setEtape(3)}>
                ← Modifier l’annonce
              </button>
              <button type="button" className="btn btn-primaire" onClick={() => setEtape(5)}>
                Continuer vers le paiement
              </button>
            </div>
          </div>
          <aside className="colle">{recapitulatif}</aside>
        </section>
      )}

      {etape === 5 && type && prix && departement && (
        <section className="tunnel-verif">
          <div>
            <p className="surtitre">Étape 5 sur 5</p>
            <h1>
              Un paiement, <em>et c’est parti</em>.
            </h1>
            <fieldset className="groupe-form" style={{ marginTop: 16 }}>
              <legend>Vos coordonnées</legend>
              <div className="grille-champs">
                {(
                  [
                    ['prenom', 'Prénom', 'text', 'given-name'],
                    ['nom', 'Nom', 'text', 'family-name'],
                    ['email', 'E-mail (attestation et facture)', 'email', 'email'],
                    ['telephone', 'Téléphone (facultatif)', 'tel', 'tel'],
                    ['societe', 'Société ou cabinet (facultatif)', 'text', 'organization'],
                  ] as const
                ).map(([nom, libelle, typeInput, auto]) => (
                  <div key={nom} className={`champ${nom === 'societe' ? ' champ-large' : ''}`}>
                    <label htmlFor={`cl-${nom}`}>{libelle}</label>
                    <input
                      id={`cl-${nom}`}
                      type={typeInput}
                      autoComplete={auto}
                      value={client[nom]}
                      onChange={(e) => setClient((c) => ({ ...c, [nom]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
            </fieldset>
            <label className="case">
              <input type="checkbox" checked={accepteCgv} onChange={(e) => setAccepteCgv(e.target.checked)} />
              <span>
                J’accepte les <Link href="/cgv" target="_blank">conditions générales de vente</Link> et la{' '}
                <Link href="/confidentialite" target="_blank">politique de confidentialité</Link>.
              </span>
            </label>
            <label className="case">
              <input type="checkbox" checked={accepteExecution} onChange={(e) => setAccepteExecution(e.target.checked)} />
              <span>
                Je demande l’exécution immédiate de la prestation et reconnais perdre mon droit de rétractation une fois l’annonce
                transmise au journal (art. L. 221-28 du Code de la consommation).
              </span>
            </label>
            {erreurPaiement && (
              <p className="alerte alerte-erreur" role="alert">
                {erreurPaiement}
              </p>
            )}
            <div className="actions">
              <button type="button" className="btn btn-secondaire" onClick={() => setEtape(4)}>
                ← Retour
              </button>
              <button type="button" className="btn btn-primaire" disabled={!clientValide || !accepteCgv || !accepteExecution || envoi} onClick={payer}>
                {envoi ? 'Redirection…' : `Payer ${euros(prix.ttc)} TTC`}
              </button>
            </div>
            <p className="petit muted" style={{ marginTop: 12 }}>
              Paiement sécurisé par Stripe. Vos coordonnées bancaires ne transitent jamais par nos serveurs.
            </p>
          </div>
          <aside className="colle">{recapitulatif}</aside>
        </section>
      )}
    </div>
  )
}
