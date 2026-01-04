import { Helmet } from 'react-helmet-async';

const SEOHead = ({ title, description }) => {
  return (
    <Helmet>
      <title>{title ? `${title} | Pure Vision DJ` : "Pure Vision DJ | AI Photo to Music Generator"}</title>
      <meta name="description" content={description || "Upload a photo and let our AI analyze your vibe to recommend the perfect Hindi, Punjabi, or Haryanvi song."} />
      <meta name="keywords" content="AI DJ, Music Recommender, Photo to Song, Punjabi Song Finder, AI Music Generator" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Pure Vision DJ - Turn Photos into Music" />
    </Helmet>
  );
};

export default SEOHead;