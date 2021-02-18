import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UtilityService } from 'src/app/shared/_services/utility.service';
import { Chapter } from 'src/app/_models/chapter';
import { Series } from 'src/app/_models/series';
import { SeriesService } from 'src/app/_services/series.service';

@Component({
  selector: 'app-edit-series-modal',
  templateUrl: './edit-series-modal.component.html',
  styleUrls: ['./edit-series-modal.component.scss']
})
export class EditSeriesModalComponent implements OnInit {

  @Input() series!: Series;
  seriesVolumes: any[] = [];
  imageStyles = {width: '74px'};
  isLoadingVolumes = false;

  isCollapsed = true;
  volumeCollapsed: any = {};
  tabs = ['General', 'Fix Match' , 'Cover Image', 'Info'];
  active = this.tabs[0];
  editSeriesForm!: FormGroup;


  constructor(private modalService: NgbModal, public modal: NgbActiveModal, private seriesService: SeriesService, public utilityService: UtilityService, private fb: FormBuilder) { }

  ngOnInit(): void {

    this.editSeriesForm = this.fb.group({
      id: new FormControl(this.series.id, []),
      summary: new FormControl(this.series.summary, []),
      name: new FormControl(this.series.name, []),
      originalName: new FormControl(this.series.originalName, []),
      sortName: new FormControl(this.series.sortName, []),
      rating: new FormControl(this.series.userRating, []),
      genres: new FormControl([''], []),
      author: new FormControl('', []),
      collections: new FormControl([''], []),
      artist: new FormControl('', []),
      coverImageIndex: new FormControl(0, [])
    });

    this.isLoadingVolumes = true;
    this.seriesService.getVolumes(this.series.id).subscribe(volumes => {
      this.seriesVolumes = volumes;
      this.isLoadingVolumes = false;

      volumes.forEach(v => {
        this.volumeCollapsed[v.name] = true;
      });
      this.seriesVolumes.forEach(vol => {
        vol.volumeFiles = vol.chapters?.sort(this.utilityService.sortChapters).map((c: Chapter) => c.files.map((f: any) => {
          f.chapter = c.number;
          return f;
        })).flat();
      });
    });
  }

  close() {
    this.modal.close({success: true, series: undefined});
  }

  formatChapterNumber(chapter: Chapter) {
    if (chapter.number === '0') {
      return '1';
    }
    return chapter.number;
  }

  save() {
    // TODO: In future (once locking or metadata implemented), do a converstion to updateSeriesDto
    this.seriesService.updateSeries(this.editSeriesForm.value).subscribe(() => {
      this.modal.close({success: true, series: this.editSeriesForm.value});
    });
  }

}
