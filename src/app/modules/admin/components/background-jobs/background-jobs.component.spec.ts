import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import {
  mostUsedImports,
  mostUsedServices,
  testUtilStubs,
} from "@shared/test-utils";

import { BackgroundJobsComponent } from "./background-jobs.component";
import { AdminToolsService } from "@services/admin-tools.service";

describe("BackgroundJobsComponent", () => {
  let component: BackgroundJobsComponent;
  let fixture: ComponentFixture<BackgroundJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BackgroundJobsComponent],
      imports: [...mostUsedImports],
      providers: [...testUtilStubs, ...mostUsedServices, AdminToolsService],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BackgroundJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
