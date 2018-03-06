import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import Cropper from 'cropperjs';
import { ImageCropperComponent } from './image-cropper.component';

describe('ImageCropperComponent', () => {
  let component: ImageCropperComponent;
  let fixture: ComponentFixture<ImageCropperComponent>;
  const fakeCanvas = document.createElement('canvas');
  const fakeCanvasUrl = fakeCanvas.toDataURL('image/jpeg');

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ImageCropperComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageCropperComponent);
    component = fixture.componentInstance;
    spyOn(Cropper.prototype, 'getCroppedCanvas')
      .and.callFake(() => fakeCanvas);
    spyOn(component.croppedImgSrc, 'emit');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('gets canvas data and emits dataURL in jpeg format', () => {
    component.getCanvasData();
    expect(component.previewSrc).toEqual(fakeCanvasUrl);
    expect(component.croppedImgSrc.emit).toHaveBeenCalled();
  });
});
