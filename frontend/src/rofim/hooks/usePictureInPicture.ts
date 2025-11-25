/* eslint @cspell/spellchecker: 0 */
import { RefObject, useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import useSessionContext from '../../hooks/useSessionContext';
import usePublisherContext from '../../hooks/usePublisherContext';
import { SubscriberWrapper } from '../../types/session';

type Timer = ReturnType<typeof setTimeout>;

const drawAvatarToCanvas = async (
  canvasRef: RefObject<HTMLCanvasElement>,
  videoContainerId: string | null,
  hasVideo: boolean
) => {
  if (videoContainerId && !hasVideo) {
    const context = canvasRef.current.getContext('2d');
    // on récupére la vignette avatar de l'utilisateur dans le dom
    const avatarElement = document.getElementById(videoContainerId);
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
    }
  }
};

const usePictureInPicture = () => {
  const { subscriberWrappers, activeSpeakerId } = useSessionContext();
  const { isVideoEnabled: isPublisherVideoEnabled, publisherVideoElement } = usePublisherContext();

  const [videoTileId, setVideoTileId] = useState('publisher-container');
  const [mostRelevantSubscriber, setMostRevevantSubscriber] = useState<SubscriberWrapper | null>(
    null
  );
  const [isSuscriberVideoEnabled, setIsSuscriberVideoEnabled] = useState(false);

  const [isPipActive, setIsPipActive] = useState(false);

  const pipVideoRef = useRef(document.createElement('video'));
  const canvasRef = useRef(document.createElement('canvas'));
  canvasRef.current.width = 640;
  canvasRef.current.height = 360;

  const stopPip = () => {
    if (isPipActive) {
      document.exitPictureInPicture().then(() => {
        setIsPipActive(false);
      });
    }
  };

  // Gestion de la fermeture au click sur la fenêtre de PiP
  useEffect(() => {
    const pipWindow = pipVideoRef.current;
    const setPipInactive = () => setIsPipActive(false);
    pipWindow.addEventListener('leavepictureinpicture', setPipInactive);

    return () => {
      pipWindow.removeEventListener('leavepictureinpicture', setPipInactive);
    };
  }, []);

  useEffect(() => {
    setIsSuscriberVideoEnabled(!!mostRelevantSubscriber?.subscriber.stream?.hasVideo);
  }, [mostRelevantSubscriber?.subscriber.stream?.hasVideo]);

  // Pour déterminer quel interlocuteur afficher
  // Soit le partage d'écran
  // Soit la personne en train de parler
  // Soit la première personne de la réunion
  // Sinon soit même
  useEffect(() => {
    const subscriber =
      subscriberWrappers.find((wrapper) => {
        return wrapper.isScreenshare;
      }) ||
      subscriberWrappers.find((wrapper) => {
        return wrapper.id === activeSpeakerId;
      }) ||
      subscriberWrappers[0];

    if (subscriber) {
      setVideoTileId(subscriber.id);
      setMostRevevantSubscriber(subscriber);
    } else if (publisherVideoElement) {
      setVideoTileId('publisher-container');
    }
  }, [subscriberWrappers, activeSpeakerId, publisherVideoElement]);

  // Gestion du contenu à mettre en PiP
  // Soit un flux vidéo / soit la vignette avatar d'un interlocuteur
  useEffect(() => {
    let intervalId: Timer;
    const videoElement =
      videoTileId === 'publisher-container'
        ? publisherVideoElement
        : mostRelevantSubscriber?.element;

    if (videoElement && isPipActive) {
      const hasVideo =
        videoTileId === 'publisher-container' ? isPublisherVideoEnabled : isSuscriberVideoEnabled;

      // Quand la caméra est allumée
      if (videoElement instanceof HTMLVideoElement && hasVideo) {
        // on stream la camére dans le Pip
        pipVideoRef.current.srcObject = videoElement.srcObject;
      } else {
        // Sinon on affiche la vignette avatar
        drawAvatarToCanvas(canvasRef, videoTileId, hasVideo);
        intervalId = setInterval(() => {
          drawAvatarToCanvas(canvasRef, videoTileId, hasVideo);
        }, 1000);
        pipVideoRef.current.srcObject = canvasRef.current.captureStream();
      }
      pipVideoRef.current.play().then(() => {
        pipVideoRef.current.requestPictureInPicture();
      });
    }
    // stop drawing loop
    return () => {
      clearInterval(intervalId);
    };
  }, [
    isPipActive,
    mostRelevantSubscriber,
    videoTileId,
    publisherVideoElement,
    isPublisherVideoEnabled,
    isSuscriberVideoEnabled,
  ]);

  const togglePip = () => {
    if (videoTileId) {
      if (!isPipActive) {
        setIsPipActive(true);
      } else {
        stopPip();
      }
    }
  };

  return {
    isPipActive,
    togglePip,
  };
};

export default usePictureInPicture;
