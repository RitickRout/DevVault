import React from 'react'
import { Helmet } from 'react-helmet-async'

const SEO = ({ 
  title, 
  description, 
  keywords, 
  canonical, 
  ogImage,
  twitterImage,
  structuredData 
}) => {
  const defaultTitle = "DevVault - Free Developer Toolkit | JSON, Regex, JWT, Hash, API Tools"
  const defaultDescription = "Free online developer toolkit with 8 essential tools: JSON formatter, Regex tester, JWT decoder, Hash generator, API tester, Git commands, Color tools, and Markdown editor. No signup required!"
  const defaultKeywords = "developer tools, JSON formatter, regex tester, JWT decoder, hash generator, API tester, git commands, color tools, markdown editor, free developer toolkit, online tools"
  const baseUrl = "https://devvault.dev"
  
  const pageTitle = title ? `${title} | DevVault` : defaultTitle
  const pageDescription = description || defaultDescription
  const pageKeywords = keywords || defaultKeywords
  const pageCanonical = canonical ? `${baseUrl}${canonical}` : baseUrl
  const pageOgImage = ogImage || `${baseUrl}/og-image.png`
  const pageTwitterImage = twitterImage || `${baseUrl}/twitter-image.png`

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={pageCanonical} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={pageCanonical} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="DevVault" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={pageCanonical} />
      <meta property="twitter:title" content={pageTitle} />
      <meta property="twitter:description" content={pageDescription} />
      <meta property="twitter:image" content={pageTwitterImage} />
      <meta property="twitter:creator" content="@devvault" />
      <meta property="twitter:site" content="@devvault" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  )
}

export default SEO
