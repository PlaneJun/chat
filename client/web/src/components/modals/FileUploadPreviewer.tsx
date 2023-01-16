import React from 'react';
import { t } from 'tailchat-shared';
import { useGlobalKeyDown } from '../../hooks/useGlobalKeyDown';
import { isEnterHotkey, isEscHotkey } from '../../utils/hot-key';
import { Button } from 'antd';
import { ModalWrapper } from '@/components/Modal';

interface FileUploadPreviewerProps {
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}
export const FileUploadPreviewer: React.FC<FileUploadPreviewerProps> =
  React.memo((props) => {

    const handleConfirm = props.onConfirm;

    useGlobalKeyDown(
      (e) => {
        if (isEnterHotkey(e)) {
          e.stopPropagation();
          handleConfirm();
        } else if (isEscHotkey(e)) {
          e.stopPropagation();
          props.onCancel();
        }
      },
      {
        capture: true,
      }
    );

    return (
      <ModalWrapper style={{ maxHeight: '30vh', maxWidth: '30vw' }}>
        <div className="flex">
          <div className="w-full p-2 flex flex-col justify-between">
            <div className="text-center">
              <div className="text-lg">{t('上传文件到会话')}</div>
            </div>

            <div className="w-full">
              
              <div className="text-center">
                <Button
                  className="mt-4"
                  type="primary"
                  onClick={handleConfirm}
                >
                  {t('确认')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ModalWrapper>
    );
  });
FileUploadPreviewer.displayName = 'FileUploadPreviewer';
