'use client';

import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/Button';

interface SignatureCanvasComponentProps {
    onSave: (data: string) => void;
    onCancel: () => void;
}

export default function SignatureCanvasComponent({ onSave, onCancel }: SignatureCanvasComponentProps) {
    const sigCanvas = useRef<any>(null);

    const clear = () => sigCanvas.current?.clear();
    const save = () => {
        if (sigCanvas.current?.isEmpty()) {
            alert("Veuillez signer avant de valider.");
            return;
        }
        // Normalize the canvas data to standard PNG data URL
        onSave(sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png'));
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 relative w-full h-full bg-white cursor-crosshair overflow-hidden touch-none">
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{ className: 'absolute inset-0 w-full h-full' }}
                    backgroundColor="rgba(0,0,0,0)"
                />
                <div className="absolute top-2 left-2 text-xs text-gray-300 pointer-events-none select-none">Zone de signature</div>
            </div>
            <div className="p-4 bg-white border-t flex justify-between gap-4 shrink-0">
                <Button variant="outline" onClick={clear} className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50">
                    Effacer
                </Button>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={onCancel}>Annuler</Button>
                    <Button onClick={save} className="bg-blue-900 text-white hover:bg-blue-800">
                        Valider
                    </Button>
                </div>
            </div>
        </div>
    );
}
