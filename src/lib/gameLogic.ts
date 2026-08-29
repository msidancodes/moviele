export function normalizeTitle(title: string): string {
    return title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function calculateAttempts(length: number): number {
    return Math.min(10, Math.max(6, length + 1));
}

export function evaluateGuess(guess: string, answer: string): ('correct' | 'present' | 'absent')[] {
    const result: ('correct' | 'present' | 'absent')[] = new Array(guess.length).fill('absent');
    const answerLetters = answer.split('');

    // First pass: find all correct letters
    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === answerLetters[i]) {
            result[i] = 'correct';
            answerLetters[i] = null as unknown as string; // Mark as consumed
        }
    }

    // Second pass: find present letters
    for (let i = 0; i < guess.length; i++) {
        if (result[i] === 'correct') continue;
        
        const index = answerLetters.indexOf(guess[i]);
        if (index !== -1) {
            result[i] = 'present';
            answerLetters[index] = null as unknown as string; // Mark as consumed
        }
    }

    return result;
}

export function selectDailyMovie<T>(movies: T[], dateString: string): T {
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
        hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
        hash |= 0;
    }
    const index = Math.abs(hash) % movies.length;
    return movies[index];
}
