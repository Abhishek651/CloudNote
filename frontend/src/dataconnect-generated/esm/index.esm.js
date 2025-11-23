import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'frontend',
  location: 'us-east4'
};

export const createNoteRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNote', inputVars);
}
createNoteRef.operationName = 'CreateNote';

export function createNote(dcOrVars, vars) {
  return executeMutation(createNoteRef(dcOrVars, vars));
}

export const listMyNotebooksRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMyNotebooks');
}
listMyNotebooksRef.operationName = 'ListMyNotebooks';

export function listMyNotebooks(dc) {
  return executeQuery(listMyNotebooksRef(dc));
}

export const addTagToNoteRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddTagToNote', inputVars);
}
addTagToNoteRef.operationName = 'AddTagToNote';

export function addTagToNote(dcOrVars, vars) {
  return executeMutation(addTagToNoteRef(dcOrVars, vars));
}

export const listAllPublicNotesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllPublicNotes');
}
listAllPublicNotesRef.operationName = 'ListAllPublicNotes';

export function listAllPublicNotes(dc) {
  return executeQuery(listAllPublicNotesRef(dc));
}

