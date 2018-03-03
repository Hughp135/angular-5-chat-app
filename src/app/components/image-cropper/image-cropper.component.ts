import {
  Component, ViewChild, ElementRef, Renderer2, AfterViewInit,
  AfterViewChecked, OnDestroy, Input, EventEmitter, Output
} from '@angular/core';
import Cropper from 'cropperjs';


interface CanvasOptions extends Cropper.GetCroppedCanvasOptions {
  imageSmoothingQuality: any;
}

@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss']
})
export class ImageCropperComponent implements AfterViewInit, OnDestroy {
  public cropper: Cropper;
  public previewSrc: string;

  @ViewChild('cropperContainer') cropperContainer: ElementRef;
  @ViewChild('preview') preview: ElementRef;
  @Input() imgSrc: string;
  constructor(private renderer: Renderer2) {
  }
  @Output() croppedImgSrc: EventEmitter<string> = new EventEmitter<string>();

  ngOnDestroy() {
    this.croppedImgSrc.emit(null);
    this.cropper = undefined;
  }

  ngAfterViewInit() {
    this.cropper = new Cropper(this.cropperContainer.nativeElement, {
      responsive: true,
      aspectRatio: 1,
      minContainerWidth: 128,
      minContainerHeight: 128,
      minCropBoxWidth: 50,
      minCropBoxHeight: 50,
      guides: false,
      autoCropArea: 1,
      background: true,
      modal: false,
      viewMode: 1,
      cropend: () => this.getCanvasData(),
      zoom: () => this.getCanvasData(),
      ready: () => this.getCanvasData(),
    });
  }

  getCanvasData() {
    const baseOptions: Cropper.GetCroppedCanvasOptions = {
      width: 128,
      height: 128,
      imageSmoothingEnabled: true,
    };

    // hack because of TS error when setting imageSmoothingQuality value
    const allOptions: any = { ...baseOptions, imageSmoothingQuality: 'high', };
    const canvasData = this.cropper.getCroppedCanvas(allOptions);
    const outputSrc = canvasData.toDataURL('image/jpeg');

    this.previewSrc = outputSrc;
    this.croppedImgSrc.emit(outputSrc);
  }
}
