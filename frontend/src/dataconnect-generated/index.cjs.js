const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'frontend',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createNoteRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNote', inputVars);
}
createNoteRef.operationName = 'CreateNote';
exports.createNoteRef = createNoteRef;

exports.createNote = function createNote(dcOrVars, vars) {
  return executeMutation(createNoteRef(dcOrVars, vars));
};

const listMyNotebooksRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMyNotebooks');
}
listMyNotebooksRef.operationName = 'ListMyNotebooks';
exports.listMyNotebooksRef = listMyNotebooksRef;

exports.listMyNotebooks = function listMyNotebooks(dc) {
  return executeQuery(listMyNotebooksRef(dc));
};

const addTagToNoteRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddTagToNote', inputVars);
}
addTagToNoteRef.operationName = 'AddTagToNote';
exports.addTagToNoteRef = addTagToNoteRef;

exports.addTagToNote = function addTagToNote(dcOrVars, vars) {
  return executeMutation(addTagToNoteRef(dcOrVars, vars));
};

const listAllPublicNotesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllPublicNotes');
}
listAllPublicNotesRef.operationName = 'ListAllPublicNotes';
exports.listAllPublicNotesRef = listAllPublicNotesRef;

exports.listAllPublicNotes = function listAllPublicNotes(dc) {
  return executeQuery(listAllPublicNotesRef(dc));
};
