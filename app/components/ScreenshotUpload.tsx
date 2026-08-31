'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface ScreenshotUploadProps {
  matchId: string;
  type: 'league' | 'cup';
  onUploadComplete?: () => void;
}

export default function ScreenshotUpload({ 
  matchId, 
  type, 
  onUploadComplete 
}: ScreenshotUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${matchId}-${Date.now()}.${fileExt}`;
      const filePath = `match-screenshots/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('match-screenshots')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setProgress(50);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('match-screenshots')
        .getPublicUrl(filePath);

      const screenshotUrl = urlData.publicUrl;
      setProgress(75);

      // Save URL to database
      const table = type === 'league' ? 'fixtures' : 'cup_matches';
      const { error: updateError } = await supabase
        .from(table)
        .update({ 
          screenshot_url: screenshotUrl,
          status: 'pending'
        })
        .eq('id', matchId);

      if (updateError) throw updateError;

      setProgress(100);

      // Notify parent
      if (onUploadComplete) {
        onUploadComplete();
      }

      alert('✅ Screenshot uploaded successfully! Admin will review it.');

    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload screenshot');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
          disabled={uploading}
          className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:file:opacity-50"
        />
        {uploading && (
          <span className="text-sm text-yellow-400">
            Uploading... {progress}%
          </span>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-400">
          ❌ {error}
        </div>
      )}

      <div className="text-xs text-gray-500">
        Upload a screenshot of the match result (optional). Max 5MB, JPG/PNG.
      </div>
    </div>
  );
}