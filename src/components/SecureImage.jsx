import React, { useState, useEffect } from 'react';
import { Spin, Image, Typography } from 'antd';
import { PictureOutlined, WarningOutlined } from '@ant-design/icons';
import { API_BASE_URL } from '../api/config';

const { Text } = Typography;

/**
 * A component that fetches an image from a protected API endpoint
 * using the authentication token and displays it.
 */
const SecureImage = ({ imageName, style = {}, alt = "Secure Image" }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!imageName) {
      setError(true);
      return;
    }

    const fetchSecureImage = async () => {
      // If it's already a full URL (http/https/blob/data), use it directly
      if (imageName.startsWith('http') || imageName.startsWith('blob:') || imageName.startsWith('data:')) {
        setImageUrl(imageName);
        return;
      }

      setLoading(true);
      setError(false);
      
      try {
        const token = localStorage.getItem("ce_token") || localStorage.getItem("authToken");
        
        // Define potential URL patterns (excluding restricted upload/file)
        const patterns = [
          `${API_BASE_URL}/uploads/${encodeURIComponent(imageName)}`,
          // Add other patterns if necessary
        ];

        let success = false;
        for (const fullUrl of patterns) {
          try {
            const response = await fetch(fullUrl, {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
              const blob = await response.blob();
              const objectUrl = URL.createObjectURL(blob);
              setImageUrl(objectUrl);
              success = true;
              break;
            }
          } catch (err) {
            console.warn(`Failed pattern ${fullUrl}:`, err);
          }
        }

        if (!success) throw new Error("Could not load image from any known endpoint");
      } catch (err) {
        console.error("Error fetching secure image:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSecureImage();

    // Cleanup: revoke the object URL to free up memory
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageName]);

  if (loading) {
    return (
      <div style={{ 
        width: style.width || 100, 
        height: style.height || 100, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f0f2f5',
        borderRadius: '8px'
      }}>
        <Spin size="small" />
      </div>
    );
  }

  if (error || !imageName) {
    return (
      <div style={{ 
        width: style.width || 100, 
        height: style.height || 100, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#fff1f0',
        border: '1px dashed #ffa39e',
        borderRadius: '8px',
        ...style
      }}>
        <WarningOutlined style={{ fontSize: 24, color: '#f5222d', marginBottom: 4 }} />
        <Text type="secondary" style={{ fontSize: '10px' }}>Failed to load</Text>
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      style={{
        borderRadius: '8px',
        objectFit: 'cover',
        ...style
      }}
      placeholder={
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin />
        </div>
      }
      fallback={<PictureOutlined />}
    />
  );
};

export default SecureImage;
