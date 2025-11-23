import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AddTagToNoteData {
  noteTag_insert: NoteTag_Key;
}

export interface AddTagToNoteVariables {
  noteId: UUIDString;
  tagId: UUIDString;
}

export interface CreateNoteData {
  note_insert: Note_Key;
}

export interface CreateNoteVariables {
  notebookId: UUIDString;
  content: string;
  isFavorite: boolean;
  title: string;
}

export interface ListAllPublicNotesData {
  notes: ({
    id: UUIDString;
    title: string;
    content: string;
    createdAt: TimestampString;
    updatedAt: TimestampString;
  } & Note_Key)[];
}

export interface ListMyNotebooksData {
  notebooks: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    createdAt: TimestampString;
  } & Notebook_Key)[];
}

export interface NoteTag_Key {
  noteId: UUIDString;
  tagId: UUIDString;
  __typename?: 'NoteTag_Key';
}

export interface Note_Key {
  id: UUIDString;
  __typename?: 'Note_Key';
}

export interface Notebook_Key {
  id: UUIDString;
  __typename?: 'Notebook_Key';
}

export interface Tag_Key {
  id: UUIDString;
  __typename?: 'Tag_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateNoteRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNoteVariables): MutationRef<CreateNoteData, CreateNoteVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateNoteVariables): MutationRef<CreateNoteData, CreateNoteVariables>;
  operationName: string;
}
export const createNoteRef: CreateNoteRef;

export function createNote(vars: CreateNoteVariables): MutationPromise<CreateNoteData, CreateNoteVariables>;
export function createNote(dc: DataConnect, vars: CreateNoteVariables): MutationPromise<CreateNoteData, CreateNoteVariables>;

interface ListMyNotebooksRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyNotebooksData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListMyNotebooksData, undefined>;
  operationName: string;
}
export const listMyNotebooksRef: ListMyNotebooksRef;

export function listMyNotebooks(): QueryPromise<ListMyNotebooksData, undefined>;
export function listMyNotebooks(dc: DataConnect): QueryPromise<ListMyNotebooksData, undefined>;

interface AddTagToNoteRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddTagToNoteVariables): MutationRef<AddTagToNoteData, AddTagToNoteVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddTagToNoteVariables): MutationRef<AddTagToNoteData, AddTagToNoteVariables>;
  operationName: string;
}
export const addTagToNoteRef: AddTagToNoteRef;

export function addTagToNote(vars: AddTagToNoteVariables): MutationPromise<AddTagToNoteData, AddTagToNoteVariables>;
export function addTagToNote(dc: DataConnect, vars: AddTagToNoteVariables): MutationPromise<AddTagToNoteData, AddTagToNoteVariables>;

interface ListAllPublicNotesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllPublicNotesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAllPublicNotesData, undefined>;
  operationName: string;
}
export const listAllPublicNotesRef: ListAllPublicNotesRef;

export function listAllPublicNotes(): QueryPromise<ListAllPublicNotesData, undefined>;
export function listAllPublicNotes(dc: DataConnect): QueryPromise<ListAllPublicNotesData, undefined>;

