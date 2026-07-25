import { ImageResponse } from 'next/og';
import axios from 'axios';

export const runtime = 'edge';

export const alt = 'Resume Preview';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }) {
  const { username, slug } = await params;
  
  let title = 'Resume';
  let role = 'Professional';
  let candidateName = username;
  
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const res = await axios.get(`${API_URL}/resumes/p/${username}/${slug}`);
    const resume = res.data;
    title = resume.title || 'Resume';
    role = resume.role || '';
    candidateName = resume.userId?.name || username;
  } catch (err) {
    console.error('Error fetching details for OG image:', err);
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundImage: 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)',
          padding: '80px',
          fontFamily: 'sans-serif',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Logo / Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '0.05em', color: '#38bdf8' }}>
              re<span style={{ color: '#f43f5e' }}>zync</span>
            </span>
            <span
              style={{
                fontSize: '14px',
                background: 'rgba(56, 189, 248, 0.1)',
                color: '#38bdf8',
                padding: '4px 10px',
                borderRadius: '12px',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                fontWeight: 'semibold',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Secure Share
            </span>
          </div>

          {/* Candidate Card */}
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '40px', gap: '8px' }}>
            <span
              style={{
                fontSize: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: '#94a3b8',
                fontWeight: 'bold',
              }}
            >
              Candidate Portfolio
            </span>
            <span style={{ fontSize: '64px', fontWeight: '800', letterSpacing: '-0.02em', color: '#ffffff' }}>
              {candidateName}
            </span>
            {role && (
              <span style={{ fontSize: '32px', color: '#38bdf8', fontWeight: '500' }}>
                {role}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            alignItems: 'center',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '40px',
          }}
        >
          <span style={{ color: '#94a3b8', fontSize: '18px' }}>
            Document: <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{title}</span>
          </span>
          <span style={{ color: '#38bdf8', fontSize: '18px', fontWeight: 'bold' }}>
            rezync.com/{username}/{slug}
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
