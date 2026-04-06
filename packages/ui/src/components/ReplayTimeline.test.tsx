import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { ReplayTimeline } from './ReplayTimeline';

describe('ReplayTimeline — time formatting', () => {
  test('formats currentTime as m:ss in the display', () => {
    render(<ReplayTimeline duration={120} currentTime={75} onSeek={() => {}} />);
    expect(screen.getByText('1:15')).not.toBeNull();
  });

  test('formats duration as m:ss in the display', () => {
    render(<ReplayTimeline duration={120} currentTime={0} onSeek={() => {}} />);
    expect(screen.getByText('2:00')).not.toBeNull();
  });

  test('pads seconds with leading zero', () => {
    render(<ReplayTimeline duration={60} currentTime={5} onSeek={() => {}} />);
    expect(screen.getByText('0:05')).not.toBeNull();
  });

  test('shows 0:01 as safe duration when duration is zero', () => {
    render(<ReplayTimeline duration={0} currentTime={0} onSeek={() => {}} />);
    expect(screen.getByText('0:01')).not.toBeNull();
  });
});

describe('ReplayTimeline — seek callback', () => {
  test('onSeek fires when ArrowRight key is pressed', () => {
    const onSeek = vi.fn(() => {});
    render(<ReplayTimeline duration={60} currentTime={10} onSeek={onSeek} />);
    const track = screen.getByRole('slider', { name: 'Seek' });
    fireEvent.keyDown(track, { key: 'ArrowRight' });
    expect(onSeek).toHaveBeenCalledTimes(1);
  });

  test('onSeek fires with currentTime + 5 on ArrowRight', () => {
    const onSeek = vi.fn((_t: number) => {});
    render(<ReplayTimeline duration={60} currentTime={10} onSeek={onSeek} />);
    const track = screen.getByRole('slider', { name: 'Seek' });
    fireEvent.keyDown(track, { key: 'ArrowRight' });
    expect(onSeek).toHaveBeenCalledWith(15);
  });

  test('onSeek fires with currentTime - 5 on ArrowLeft', () => {
    const onSeek = vi.fn((_t: number) => {});
    render(<ReplayTimeline duration={60} currentTime={10} onSeek={onSeek} />);
    const track = screen.getByRole('slider', { name: 'Seek' });
    fireEvent.keyDown(track, { key: 'ArrowLeft' });
    expect(onSeek).toHaveBeenCalledWith(5);
  });

  test('onSeek does not go below 0 on ArrowLeft at time 0', () => {
    const onSeek = vi.fn((_t: number) => {});
    render(<ReplayTimeline duration={60} currentTime={0} onSeek={onSeek} />);
    const track = screen.getByRole('slider', { name: 'Seek' });
    fireEvent.keyDown(track, { key: 'ArrowLeft' });
    expect(onSeek).toHaveBeenCalledWith(0);
  });

  test('onSeek does not exceed duration on ArrowRight at end', () => {
    const onSeek = vi.fn((_t: number) => {});
    render(<ReplayTimeline duration={60} currentTime={58} onSeek={onSeek} />);
    const track = screen.getByRole('slider', { name: 'Seek' });
    fireEvent.keyDown(track, { key: 'ArrowRight' });
    expect(onSeek).toHaveBeenCalledWith(60);
  });
});

describe('ReplayTimeline — markers', () => {
  const markers = [
    { time: 10, label: 'Tool call', type: 'event' as const },
    { time: 30, label: 'Exception', type: 'error' as const },
    { time: 50, label: 'Checkpoint', type: 'milestone' as const },
  ];

  test('renders one element per marker', () => {
    const { container } = render(
      <ReplayTimeline duration={60} currentTime={0} onSeek={() => {}} markers={markers} />,
    );
    // Each marker has a title attribute
    const dots = container.querySelectorAll('[title]');
    expect(dots.length).toBe(3);
  });

  test('marker title includes the marker label', () => {
    const { container } = render(
      <ReplayTimeline duration={60} currentTime={0} onSeek={() => {}} markers={markers} />,
    );
    const titles = Array.from(container.querySelectorAll('[title]')).map(
      (el) => el.getAttribute('title') ?? '',
    );
    expect(titles.some((t) => t.includes('Tool call'))).toBe(true);
  });

  test('error marker uses red color class', () => {
    const { container } = render(
      <ReplayTimeline duration={60} currentTime={0} onSeek={() => {}} markers={[markers[1]]} />,
    );
    expect(container.querySelector('.bg-red-500')).not.toBeNull();
  });

  test('milestone marker uses amber color class', () => {
    const { container } = render(
      <ReplayTimeline duration={60} currentTime={0} onSeek={() => {}} markers={[markers[2]]} />,
    );
    expect(container.querySelector('.bg-amber-400')).not.toBeNull();
  });

  test('event marker uses blue color class', () => {
    const { container } = render(
      <ReplayTimeline duration={60} currentTime={0} onSeek={() => {}} markers={[markers[0]]} />,
    );
    expect(container.querySelector('.bg-blue-400')).not.toBeNull();
  });

  test('renders no marker elements when markers prop is omitted', () => {
    const { container } = render(
      <ReplayTimeline duration={60} currentTime={0} onSeek={() => {}} />,
    );
    expect(container.querySelectorAll('[title]').length).toBe(0);
  });
});
