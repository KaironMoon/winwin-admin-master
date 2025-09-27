import { useEffect } from 'react';
import { Play, Square } from 'lucide-react';

import { useAtomValue, useSetAtom } from 'jotai';
import { isDemoAtom, setIsDemoAtom } from '../../stores/isDemoStore';

function IsDemoView() {
    const isDemo = useAtomValue(isDemoAtom);
    const setIsDemo = useSetAtom(setIsDemoAtom);

    useEffect(() => {
        console.log('isDemo', isDemo);
    }, [isDemo]);

    const handleToggle = () => {
        setIsDemo(!isDemo);
    };

    return (
        <button
            onClick={handleToggle}
            className={`
                flex items-center space-x-1 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-md sm:rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium
                ${isDemo 
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow' 
                    : 'bg-accent hover:bg-accent/80 text-foreground border border-border'
                }
            `}
            title={isDemo ? 'Demo Mode ON' : 'Demo Mode OFF'}
        >
            {isDemo ? (
                <>
                    <Play className="w-4 h-4" />
                    <span className="hidden sm:inline">Demo ON</span>
                    <span className="sm:hidden">Demo</span>
                </>
            ) : (
                <>
                    <Square className="w-4 h-4" />
                    <span className="hidden sm:inline">Demo OFF</span>
                    <span className="sm:hidden">Demo</span>
                </>
            )}
        </button>
    );
}

export default IsDemoView;