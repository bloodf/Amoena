import { type NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  generatePairingCode,
  getPairedDeviceIds,
  revokeDevice,
} from '@lunaria/amoena-service/remote-access/pairing';

/**
 * GET /api/remote
 *
 * Returns the list of currently paired device IDs.
 * Requires at least the "viewer" role.
 */
export async function GET(request: NextRequest) {
  const auth = requireRole(request, 'viewer');
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const deviceIds = getPairedDeviceIds();
    return NextResponse.json({ devices: deviceIds });
  } catch (error) {
    logger.error({ err: error }, 'Remote access GET error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/remote
 *
 * Starts a new pairing session.  Returns a 6-digit PIN and a QR data URL.
 * Requires at least the "operator" role.
 */
export async function POST(request: NextRequest) {
  const auth = requireRole(request, 'operator');
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { pin, qr } = generatePairingCode();
    return NextResponse.json({ pin, qr });
  } catch (error) {
    logger.error({ err: error }, 'Remote access POST error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/remote
 *
 * Revokes pairing for the device identified by `deviceId` in the request body.
 * Requires at least the "operator" role.
 */
export async function DELETE(request: NextRequest) {
  const auth = requireRole(request, 'operator');
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = (await request.json()) as { deviceId?: unknown };
    const { deviceId } = body;

    if (typeof deviceId !== 'string' || deviceId.trim() === '') {
      return NextResponse.json({ error: 'deviceId is required' }, { status: 400 });
    }

    const removed = revokeDevice(deviceId.trim());
    if (!removed) {
      return NextResponse.json({ error: 'Device not found or not paired' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Remote access DELETE error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
