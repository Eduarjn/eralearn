import React from 'react';
import Modal from 'react-modal';
import { VideoFile } from '@/hooks/useVideos';
import { VideoPlayer } from './VideoPlayer';
import { SidebarLessons } from './SidebarLessons';

interface Module {
  id: string;
  title: string;
}

interface VideoModalProps {
  video: VideoFile | null;
  open: boolean;
  onClose: () => void;
  modules: Module[];
  selectedModuleId?: string;
  onSelectModule?: (moduleId: string) => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ video, open, onClose, modules, selectedModuleId, onSelectModule }) => {
  if (!video) return null;
  return (
    <Modal
      isOpen={open}
      onRequestClose={onClose}
      className="fixed inset-0 flex items-center justify-center z-50"
      overlayClassName="fixed inset-0 bg-black bg-opacity-60 z-40"
      ariaHideApp={false}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-7/10 p-4">
          <VideoPlayer video={video} />
        </div>
        <div className="w-full md:w-3/10 border-l p-4 bg-gray-50">
          <SidebarLessons modules={modules} selectedModuleId={selectedModuleId} onSelectModule={onSelectModule} />
        </div>
      </div>
    </Modal>
  );
}; 