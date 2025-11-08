import React from 'react';
import QRCode from 'qrcode.react';
import type { Pet } from '../types';

interface ShareModalProps {
  pet: Pet;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ pet, onClose }) => {
  const shareUrl = `${window.location.origin}/pets/${pet.id}`;
  const message = `Help find ${pet.name}! Last seen near ${pet.last_seen_address || 'unknown location'}. ${shareUrl}`;

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank'
    );
  };

  const shareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  const shareToReddit = () => {
    window.open(
      `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(`Help find ${pet.name}`)}`,
      '_blank'
    );
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Share {pet.name}'s Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* QR Code */}
          <div className="flex justify-center p-4 bg-gray-50 rounded">
            <QRCode value={shareUrl} size={200} />
          </div>

          <p className="text-sm text-gray-600 text-center">
            Scan this QR code to view the pet profile
          </p>

          {/* Share buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={shareToFacebook}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Facebook
            </button>
            <button
              onClick={shareToTwitter}
              className="flex items-center justify-center px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors"
            >
              Twitter
            </button>
            <button
              onClick={shareToReddit}
              className="flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              Reddit
            </button>
            <button
              onClick={copyLink}
              className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Copy Link
            </button>
          </div>

          {/* Link input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Share Link
            </label>
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              onClick={(e) => e.currentTarget.select()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
