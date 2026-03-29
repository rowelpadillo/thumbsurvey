// src/app/survey/survey.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { SurveyComponent } from './survey.component';

const routes: Routes = [
  { path: '', component: SurveyComponent },
];

@NgModule({
  declarations: [SurveyComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
})
export class SurveyModule {}