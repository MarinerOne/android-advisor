import { useState } from 'react';
import { Button } from '../common/Button';
import { buildShareUrl } from '../../domain/share';
import type { QuizAnswers } from '../../domain/types';

interface ShareButtonProps {
  answers: QuizAnswers;
}

export function ShareButton({ answers }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = buildShareUrl(answers);

    // Prefer the native share sheet on supported devices (great for mobile).
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Android Advisor picks',
          text: 'Check out the Android phones that matched me!',
          url,
        });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — show the URL so the user can copy manually.
      window.prompt('Copy your results link:', url);
    }
  }

  return (
    <Button variant="secondary" onClick={share}>
      {copied ? 'Link copied! ✅' : 'Share my results 🔗'}
    </Button>
  );
}
