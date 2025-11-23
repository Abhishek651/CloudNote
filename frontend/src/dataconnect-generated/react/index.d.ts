import { CreateNoteData, CreateNoteVariables, ListMyNotebooksData, AddTagToNoteData, AddTagToNoteVariables, ListAllPublicNotesData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateNote(options?: useDataConnectMutationOptions<CreateNoteData, FirebaseError, CreateNoteVariables>): UseDataConnectMutationResult<CreateNoteData, CreateNoteVariables>;
export function useCreateNote(dc: DataConnect, options?: useDataConnectMutationOptions<CreateNoteData, FirebaseError, CreateNoteVariables>): UseDataConnectMutationResult<CreateNoteData, CreateNoteVariables>;

export function useListMyNotebooks(options?: useDataConnectQueryOptions<ListMyNotebooksData>): UseDataConnectQueryResult<ListMyNotebooksData, undefined>;
export function useListMyNotebooks(dc: DataConnect, options?: useDataConnectQueryOptions<ListMyNotebooksData>): UseDataConnectQueryResult<ListMyNotebooksData, undefined>;

export function useAddTagToNote(options?: useDataConnectMutationOptions<AddTagToNoteData, FirebaseError, AddTagToNoteVariables>): UseDataConnectMutationResult<AddTagToNoteData, AddTagToNoteVariables>;
export function useAddTagToNote(dc: DataConnect, options?: useDataConnectMutationOptions<AddTagToNoteData, FirebaseError, AddTagToNoteVariables>): UseDataConnectMutationResult<AddTagToNoteData, AddTagToNoteVariables>;

export function useListAllPublicNotes(options?: useDataConnectQueryOptions<ListAllPublicNotesData>): UseDataConnectQueryResult<ListAllPublicNotesData, undefined>;
export function useListAllPublicNotes(dc: DataConnect, options?: useDataConnectQueryOptions<ListAllPublicNotesData>): UseDataConnectQueryResult<ListAllPublicNotesData, undefined>;
