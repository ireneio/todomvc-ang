import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-base-loader',
  templateUrl: './base-loader.component.html',
  styleUrls: ['./base-loader.component.scss']
})
export class BaseLoaderComponent implements OnInit {

  constructor() { }

  @Input() loading: boolean = false

  ngOnInit(): void {
  }

}
