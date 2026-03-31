import React from 'react';
import { Modal, Button, Space, Typography } from 'antd';
import { ExclamationCircleOutlined, CheckCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

/**
 * A reusable confirmation dialog adapted from the user's Shadcn-style request
 * to fit the project's Ant Design ecosystem.
 */
export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onConfirmAll,
  confirmButtonText = "Confirm Selected",
  confirmAllButtonText = "Confirm All",
  cancelButtonText = "Cancel",
  isConfirmationInProgress = false,
}) {
  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      title={
        <Space size="middle">
          <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '20px' }} />
          <span>{title}</span>
        </Space>
      }
      footer={[
        <Button key="cancel" onClick={() => onOpenChange(false)} disabled={isConfirmationInProgress}>
          {cancelButtonText}
        </Button>,
        <Space key="actions">
          {onConfirmAll && (
            <Button
              type="primary"
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              icon={<ThunderboltOutlined />}
              onClick={onConfirmAll}
              loading={isConfirmationInProgress}
            >
              {confirmAllButtonText}
            </Button>
          )}
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={onConfirm}
            loading={isConfirmationInProgress}
          >
            {confirmButtonText}
          </Button>
        </Space>
      ]}
      width={450}
      centered
    >
      <div style={{ padding: '8px 0 16px 36px' }}>
        <Paragraph type="secondary" style={{ fontSize: '14px', margin: 0 }}>
          {description}
        </Paragraph>
      </div>
    </Modal>
  );
}
