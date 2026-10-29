export interface QuestionReponse {
  q: string
  r: string
}

export function Faq({ questions }: { questions: QuestionReponse[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.r } })),
  }
  return (
    <div className="faq">
      {questions.map((x) => (
        <details key={x.q}>
          <summary>{x.q}</summary>
          <p>{x.r}</p>
        </details>
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </div>
  )
}
