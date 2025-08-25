/* eslint @cspell/spellchecker: 0 */

import { useCallback, useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import useSessionContext from '../../hooks/useSessionContext';
import { SubscriberWrapper } from '../../types/session';

const usePictureInPicture = () => {
  const { subscriberWrappers, activeSpeakerId } = useSessionContext();
  const [subscriberWrapper, setSubscriberWrapper] = useState<SubscriberWrapper | null>(null);
  const [isPipAvailable, setIsPipAvailable] = useState<boolean>(false);
  const [isPipActive, setIsPipActive] = useState(false);
  const isPipActiveRef = useRef(isPipActive);

  const pipVideoRef = useRef(document.createElement('video'));
  const canvasRef = useRef(document.createElement('canvas'));
  canvasRef.current.width = 640;
  canvasRef.current.height = 360;

  const stopPip = useCallback(async () => {
    if (isPipActive) {
      await document.exitPictureInPicture();
    }
    setIsPipActive(false);
  }, [isPipActive]);

  const draw = useCallback(async () => {
    if (
      isPipActiveRef.current &&
      subscriberWrapper &&
      !subscriberWrapper?.subscriber.stream?.hasVideo
    ) {
      const context = canvasRef.current.getContext('2d');
      // on récupére la vignette avatar de l'utilisateur dans le dom
      const avatarElement = document.getElementById(subscriberWrapper.id);

      if (context && avatarElement) {
        // On copie l'élement dans une nouvelle div qu'on va resize et afficher en arrière plan (z-index -1000)
        const copy = document.createElement('div');
        copy.appendChild(avatarElement?.cloneNode(true));
        copy.classList.add('avatar-canvas', 'bg-notVeryGray-100');
        document.body.appendChild(copy);

        // On transforme ce composant en canvas
        const avatarCanvas = await html2canvas(copy, {
          allowTaint: true,
          width: 640,
          height: 360,
        });
        // Pour l'afficher dans notre canvas qu'on va stream dans le PiP
        context?.drawImage(avatarCanvas, 0, 0, 640, 360);

        // Une fois le screenshot effectuer, on retire l'élément du dom
        document.body.removeChild(copy);
        setTimeout(() => {
          // On recommence le process tant que le PiP est actif
          draw();
        }, 1000);
      }
    }
  }, [subscriberWrapper]);

  // Gestion de la fermeture au click sur la fenêtre de PiP
  useEffect(() => {
    const pipWindow = pipVideoRef.current;
    const setPipInactive = () => setIsPipActive(false);
    pipWindow.addEventListener('leavepictureinpicture', setPipInactive);

    return () => {
      pipWindow.removeEventListener('leavepictureinpicture', setPipInactive);
    };
  }, []);

  // j'ai besoin de ça pour sortir de la boucle de draw quand je suis en PiP AvatarInitials
  // la valeur du state isPipActive ne change pas dans les appels successifs à draw
  useEffect(() => {
    isPipActiveRef.current = isPipActive;
  }, [isPipActive]);

  // Pour déterminer quel interlocuteur afficher
  // Soit le partage d'écran
  // Soit la personne en train de parler
  // Soit la première personne de la réunion
  useEffect(() => {
    const mostRelevantSubscriber =
      subscriberWrappers.find((wrapper) => {
        return wrapper.isScreenshare;
      }) ||
      subscriberWrappers.find((wrapper) => {
        return wrapper.id === activeSpeakerId;
      }) ||
      subscriberWrappers[0];

    if (mostRelevantSubscriber) {
      setSubscriberWrapper(mostRelevantSubscriber);
      setIsPipAvailable(true);
    } else {
      setSubscriberWrapper(null);
      setIsPipAvailable(false);
      stopPip();
    }
  }, [subscriberWrappers, activeSpeakerId, stopPip]);

  // Gestion du contenu à mettre en PiP
  // Soit un flux vidéo / soit la vignette avatar d'un interlocuteur
  useEffect(() => {
    const renderPipVideo = async () => {
      if (subscriberWrapper && isPipActive) {
        // Quand la caméra est allumée
        if (
          subscriberWrapper.element instanceof HTMLVideoElement &&
          subscriberWrapper.subscriber.stream?.hasVideo
        ) {
          // on stream la camére dans le Pip
          pipVideoRef.current.srcObject = subscriberWrapper.element.srcObject;
        } else {
          // Sinon on affiche la vignette avatar
          draw();
          pipVideoRef.current.srcObject = canvasRef.current.captureStream();
        }

        await pipVideoRef.current.play();

        setTimeout(async () => {
          await pipVideoRef.current.requestPictureInPicture();
        }, 100);
      }
    };

    renderPipVideo();
  }, [
    draw,
    subscriberWrapper,
    subscriberWrapper?.subscriber.stream?.hasVideo,
    subscriberWrapper?.element,
    isPipActive,
  ]);

  const togglePip = () => {
    if (isPipAvailable && subscriberWrapper) {
      if (!isPipActive) {
        setIsPipActive(true);
      } else {
        stopPip();
      }
    }
  };

  return {
    isPipAvailable,
    isPipActive,
    togglePip,
  };
};

export default usePictureInPicture;
