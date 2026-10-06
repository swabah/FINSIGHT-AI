import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  name?: string;
  type?: string;
}

export function SEO({ 
  title, 
  description, 
  name, 
  type 
}: SEOProps) {
  const defaultTitle = "FinSight AI – RAG-Driven Personal Finance Manager";
  const defaultDescription = "FinSight AI is an AI-powered personal finance manager. Track transactions, get smart insights, and chat with your finances using cutting-edge RAG technology.";
  const defaultName = "FinSight AI";
  const defaultType = "website";

  const seoTitle = title ? `${title} | ${defaultName}` : defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoType = type || defaultType;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      
      {/* Facebook tags */}
      <meta property="og:type" content={seoType} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content={name || defaultName} />
      <meta name="twitter:card" content={seoType === "article" ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
    </Helmet>
  );
}
