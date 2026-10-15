import { useEffect, useRef, useState } from 'react';

export type ModalNavigation = (id: string, onReturn?: () => void, signal?: AbortSignal) => Promise<boolean>;

export function useModalNavigation(isOpen: boolean, navigate?: ModalNavigation) {
    const [suspended, setSuspended] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const requestRef = useRef<AbortController | null>(null);
    useEffect(() => () => { requestRef.current?.abort(); requestRef.current = null; setPending(false); }, [isOpen]);
    const open = async (id: string) => {
        if (!navigate || requestRef.current) return;
        const request = new AbortController();
        requestRef.current = request;
        setPending(true); setError('');
        try {
            const opened = await navigate(id, () => setSuspended(false), request.signal);
            if (request.signal.aborted) return;
            if (opened) setSuspended(true);
            else setError('A kapcsolódó rekord nem tölthető be. Próbáld újra.');
        } catch {
            if (!request.signal.aborted) setError('A kapcsolódó rekord nem tölthető be. Próbáld újra.');
        } finally {
            if (requestRef.current === request) requestRef.current = null;
            if (!request.signal.aborted) setPending(false);
        }
    };
    return { suspended, pending, error, open };
}
