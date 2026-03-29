import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-auto py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600">
        <p>
          Questions? Contact us at{' '}
          <a
            href="mailto:questions@seniorcybersecurityedu.awsapps.com"
            className="text-primary-600 hover:underline"
          >
            questions@seniorcybersecurityedu.awsapps.com
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
