import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { RemoteDevicesPanel } from './RemoteDevicesPanel';
import { RemotePairingPanel } from './RemotePairingPanel';
import { RemoteTerminalSettingsPanel } from './RemoteTerminalSettingsPanel';
import { initialRemoteDevices } from './config';
import type { RemoteDevice } from './types';

/* ------------------------------------------------------------------ */
/*  RemoteDevicesPanel                                                 */
/* ------------------------------------------------------------------ */

const devicesMeta = {
  title: 'Composites/Remote/RemoteDevicesPanel',
  component: RemoteDevicesPanel,
  parameters: { layout: 'centered' },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: 640 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RemoteDevicesPanel>;

export default devicesMeta;
type DevicesStory = StoryObj<typeof devicesMeta>;

const extraDevices: RemoteDevice[] = [
  ...initialRemoteDevices,
  {
    name: 'MacBook Air',
    ip: '192.168.1.87',
    connectedSince: '8:30 AM',
    trusted: true,
    lastSeen: 'Active now',
    relay: 'relay',
    permissions: ['chat', 'terminal'],
  },
  {
    name: 'iPad Mini',
    ip: '192.168.1.103',
    connectedSince: 'Yesterday',
    trusted: false,
    lastSeen: '2 hours ago',
    relay: 'offline',
    permissions: ['chat'],
  },
  {
    name: 'Galaxy Tab S9',
    ip: '192.168.1.55',
    connectedSince: '—',
    trusted: false,
    lastSeen: 'Connecting…',
    relay: 'waiting',
    permissions: [],
  },
];

export const SingleDevice: DevicesStory = {
  args: {
    devices: initialRemoteDevices,
    confirmRevoke: null,
    onToggleTrust: fn(),
    onAskRevoke: fn(),
    onCancelRevoke: fn(),
    onConfirmRevoke: fn(),
  },
};

export const MultipleDevices: DevicesStory = {
  args: {
    devices: extraDevices,
    confirmRevoke: null,
    onToggleTrust: fn(),
    onAskRevoke: fn(),
    onCancelRevoke: fn(),
    onConfirmRevoke: fn(),
  },
};

export const RevokeConfirmation: DevicesStory = {
  args: {
    devices: extraDevices,
    confirmRevoke: 'iPad Mini',
    onToggleTrust: fn(),
    onAskRevoke: fn(),
    onCancelRevoke: fn(),
    onConfirmRevoke: fn(),
  },
};

export const NoDevices: DevicesStory = {
  args: {
    devices: [],
    confirmRevoke: null,
    onToggleTrust: fn(),
    onAskRevoke: fn(),
    onCancelRevoke: fn(),
    onConfirmRevoke: fn(),
  },
};

/* ------------------------------------------------------------------ */
/*  RemotePairingPanel                                                 */
/* ------------------------------------------------------------------ */

type PairingStory = StoryObj<typeof RemotePairingPanel>;

export const PinHidden: PairingStory = {
  render: (args) => <RemotePairingPanel {...args} />,
  args: {
    pin: '482 916',
    expiryLabel: 'Expires in 4:32',
    showPin: false,
    onTogglePin: fn(),
    onRegenerate: fn(),
  },
};

export const PinVisible: PairingStory = {
  render: (args) => <RemotePairingPanel {...args} />,
  args: {
    pin: '482 916',
    expiryLabel: 'Expires in 4:32',
    showPin: true,
    onTogglePin: fn(),
    onRegenerate: fn(),
  },
};

export const PinExpiring: PairingStory = {
  render: (args) => <RemotePairingPanel {...args} />,
  args: {
    pin: '739 201',
    expiryLabel: 'Expires in 0:12',
    showPin: true,
    onTogglePin: fn(),
    onRegenerate: fn(),
  },
};

/* ------------------------------------------------------------------ */
/*  RemoteTerminalSettingsPanel                                        */
/* ------------------------------------------------------------------ */

type TerminalStory = StoryObj<typeof RemoteTerminalSettingsPanel>;

export const Enabled: TerminalStory = {
  render: (args) => <RemoteTerminalSettingsPanel {...args} />,
  args: {
    remoteTerminal: true,
    readOnlyMode: false,
    sessionTimeout: '30 minutes',
    onToggleRemoteTerminal: fn(),
    onToggleReadOnlyMode: fn(),
    onSessionTimeoutChange: fn(),
  },
};

export const ReadOnly: TerminalStory = {
  render: (args) => <RemoteTerminalSettingsPanel {...args} />,
  args: {
    remoteTerminal: true,
    readOnlyMode: true,
    sessionTimeout: '30 minutes',
    onToggleRemoteTerminal: fn(),
    onToggleReadOnlyMode: fn(),
    onSessionTimeoutChange: fn(),
  },
};

export const Disabled: TerminalStory = {
  render: (args) => <RemoteTerminalSettingsPanel {...args} />,
  args: {
    remoteTerminal: false,
    readOnlyMode: false,
    sessionTimeout: '30 minutes',
    onToggleRemoteTerminal: fn(),
    onToggleReadOnlyMode: fn(),
    onSessionTimeoutChange: fn(),
  },
};

export const LongTimeout: TerminalStory = {
  render: (args) => <RemoteTerminalSettingsPanel {...args} />,
  args: {
    remoteTerminal: true,
    readOnlyMode: false,
    sessionTimeout: '4 hours',
    onToggleRemoteTerminal: fn(),
    onToggleReadOnlyMode: fn(),
    onSessionTimeoutChange: fn(),
  },
};
