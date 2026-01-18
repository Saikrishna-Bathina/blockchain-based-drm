import React from 'react';

const Placeholder = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
      <p className="text-gray-400">This feature is coming soon.</p>
    </div>
  );
};

export default Placeholder;
