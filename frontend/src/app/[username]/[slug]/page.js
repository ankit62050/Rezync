import axios from 'axios';
import ResumeViewer from './ResumeViewer';

export async function generateMetadata({ params }) {
  const { username, slug } = await params;
  
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const res = await axios.get(`${API_URL}/resumes/p/${username}/${slug}`);
    const resume = res.data;
    
    const candidateName = resume.userId?.name || username;
    const title = `${resume.title} - Rezync`;
    const description = `Securely view the resume/portfolio of ${candidateName} (${resume.role || 'Professional'}) on Rezync. Live scroll and view engagement metrics enabled.`;
    
    // We construct the OG Image URL using our dynamic opengraph-image generator
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const ogImageUrl = `${appUrl}/${username}/${slug}/opengraph-image`;
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'profile',
        username: username,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${candidateName}'s Resume on Rezync`,
          }
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImageUrl],
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Resume | Rezync',
      description: 'View document shared securely via Rezync.',
    };
  }
}

export default async function PublicResumePage({ params }) {
  const { username, slug } = await params;
  return <ResumeViewer username={username} slug={slug} />;
}
