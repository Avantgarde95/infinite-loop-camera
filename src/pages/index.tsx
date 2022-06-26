import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";

import { getTimeStrings, getTime } from "utils/DateUtils";
import useCamera from "hooks/useCamera";
import useCanvas from "hooks/useCanvas";
import useVideo from "hooks/useVideo";
import useAnimation from "hooks/useAnimation";
import Video from "templates/Video";
import Controls from "templates/Controls";

function downloadCanvas(context: CanvasRenderingContext2D, fileName: string) {
  const link = document.createElement("a");
  link.download = fileName;

  const dataURL = context.canvas.toDataURL("image/png");

  link.href = dataURL.replace(
    /^data:image\/png/,
    "data:application/octet-stream"
  );

  link.click();
}

const HomePage = () => {
  const [flipCamera, setFlipCamera] = useState(false);

  const { cameras, currentCameraIndex, setCurrentCameraIndex } = useCamera();
  const { setCanvasRef, context } = useCanvas();

  const currentCamera =
    currentCameraIndex < cameras.length
      ? cameras[currentCameraIndex]
      : undefined;

  const { video } = useVideo(currentCamera?.mediaStream, (video) => {
    if (context === null) {
      return;
    }

    const width = 1024;
    const height = video.videoHeight / (video.videoWidth / width);

    video.width = width;
    video.height = height;
    context.canvas.width = Math.min(width, height);
    context.canvas.height = Math.min(width, height);
  });

  useAnimation(() => {
    if (context === null) {
      return;
    }

    if (typeof video === "undefined") {
      return;
    }

    const width = context.canvas.width;
    const height = context.canvas.height;

    context.fillStyle = "#000000";
    context.fillRect(0, 0, width, height);
    context.save();

    if (flipCamera) {
      context.translate(width, 0);
      context.scale(-1, 1);
    }

    context.drawImage(video, 0, 0);
    context.restore();

    context.fillStyle = "white";
    context.font = '16px "Gaegu", sans-serif';

    const title = "∞ Infinite loop coding";
    const titleWidth = context.measureText(title).width;

    context.font = `${(16 / titleWidth) * (width * 0.4)}px "Gaegu", sans-serif`;

    context.fillText(title, width - context.measureText(title).width - 20, 50);

    const timeStrings = getTimeStrings(getTime(new Date()));

    context.fillText(
      `${timeStrings.year}.${timeStrings.month}.${timeStrings.monthDay} (${timeStrings.weekDay})`,
      20,
      height - 80
    );

    context.fillText(
      `${timeStrings.hour}:${timeStrings.minute} ${timeStrings.ampm}`,
      20,
      height - 40
    );
  }, 15);

  useEffect(() => {
    if (typeof currentCamera === "undefined") {
      return;
    }

    // For the sake of convenience, we flip the camera automatically in some cases.
    setFlipCamera(currentCamera.type !== "Back");
  }, [currentCamera, setFlipCamera]);

  const handleFlipCamera = () => {
    setFlipCamera(!flipCamera);
  };

  const handleCaptureCamera = () => {
    if (context === null) {
      return;
    }

    downloadCanvas(context, "Download.png");
  };

  const handleSelectCamera = (index: number) => {
    setCurrentCameraIndex(index);
  };

  return (
    <Container>
      <Video setCanvasRef={setCanvasRef} />
      <Controls
        cameraNames={cameras.map(
          (camera, index) => `Camera ${index + 1} (Type: ${camera.type})`
        )}
        onFlipCamera={handleFlipCamera}
        onCaptureCamera={handleCaptureCamera}
        onSelectCamera={handleSelectCamera}
      />
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

export default HomePage;
