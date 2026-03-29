import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'survey',
    // This perfectly bridges your modern app to your traditional SurveyModule
    loadChildren: () => import('./survey/survey.module').then((m) => m.SurveyModule),
  },
  { path: '', redirectTo: 'survey', pathMatch: 'full' },
  { path: '**', redirectTo: 'survey' },
];