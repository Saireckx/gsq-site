import React from 'react';
import { MAP_URL } from '../lib/constants';

export const Map: React.FC = () => {
  return (
    <div className="w-full h-[calc(100vh-80px)] bg-[#08080a] overflow-hidden">
      <iframe
        src={MAP_URL}
        title="Онлайн карта GSQ"
        className="w-full h-full border-0 select-none bg-neutral-950"
        allow="fullscreen"
      />
    </div>
  );
};
