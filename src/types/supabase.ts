export interface SubmissionInsertRow {
  ward_name: string;
  inspector_name: string;
  inspection_date: string;
  handover_batch: string;
  remarks: string;
  total_items: number;
  pass_count: number;
  fail_count: number;
  pending_count: number;
  na_count: number;
}

export interface SubmissionItemInsertRow {
  submission_id: string;
  source_key: string;
  item_id: string;
  sheet_name: string;
  category: string;
  element: string;
  target_location: string;
  status: string;
  notes: string;
}

export interface SubmissionPhotoInsertRow {
  submission_item_id: string;
  file_name: string;
  storage_path: string;
  photo_url: string;
  position: number;
}
