# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListMyNotebooks*](#listmynotebooks)
  - [*ListAllPublicNotes*](#listallpublicnotes)
- [**Mutations**](#mutations)
  - [*CreateNote*](#createnote)
  - [*AddTagToNote*](#addtagtonote)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListMyNotebooks
You can execute the `ListMyNotebooks` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listMyNotebooks(): QueryPromise<ListMyNotebooksData, undefined>;

interface ListMyNotebooksRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyNotebooksData, undefined>;
}
export const listMyNotebooksRef: ListMyNotebooksRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listMyNotebooks(dc: DataConnect): QueryPromise<ListMyNotebooksData, undefined>;

interface ListMyNotebooksRef {
  ...
  (dc: DataConnect): QueryRef<ListMyNotebooksData, undefined>;
}
export const listMyNotebooksRef: ListMyNotebooksRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listMyNotebooksRef:
```typescript
const name = listMyNotebooksRef.operationName;
console.log(name);
```

### Variables
The `ListMyNotebooks` query has no variables.
### Return Type
Recall that executing the `ListMyNotebooks` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListMyNotebooksData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListMyNotebooksData {
  notebooks: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    createdAt: TimestampString;
  } & Notebook_Key)[];
}
```
### Using `ListMyNotebooks`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listMyNotebooks } from '@dataconnect/generated';


// Call the `listMyNotebooks()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listMyNotebooks();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listMyNotebooks(dataConnect);

console.log(data.notebooks);

// Or, you can use the `Promise` API.
listMyNotebooks().then((response) => {
  const data = response.data;
  console.log(data.notebooks);
});
```

### Using `ListMyNotebooks`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listMyNotebooksRef } from '@dataconnect/generated';


// Call the `listMyNotebooksRef()` function to get a reference to the query.
const ref = listMyNotebooksRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listMyNotebooksRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.notebooks);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.notebooks);
});
```

## ListAllPublicNotes
You can execute the `ListAllPublicNotes` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAllPublicNotes(): QueryPromise<ListAllPublicNotesData, undefined>;

interface ListAllPublicNotesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllPublicNotesData, undefined>;
}
export const listAllPublicNotesRef: ListAllPublicNotesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAllPublicNotes(dc: DataConnect): QueryPromise<ListAllPublicNotesData, undefined>;

interface ListAllPublicNotesRef {
  ...
  (dc: DataConnect): QueryRef<ListAllPublicNotesData, undefined>;
}
export const listAllPublicNotesRef: ListAllPublicNotesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAllPublicNotesRef:
```typescript
const name = listAllPublicNotesRef.operationName;
console.log(name);
```

### Variables
The `ListAllPublicNotes` query has no variables.
### Return Type
Recall that executing the `ListAllPublicNotes` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAllPublicNotesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAllPublicNotesData {
  notes: ({
    id: UUIDString;
    title: string;
    content: string;
    createdAt: TimestampString;
    updatedAt: TimestampString;
  } & Note_Key)[];
}
```
### Using `ListAllPublicNotes`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAllPublicNotes } from '@dataconnect/generated';


// Call the `listAllPublicNotes()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAllPublicNotes();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAllPublicNotes(dataConnect);

console.log(data.notes);

// Or, you can use the `Promise` API.
listAllPublicNotes().then((response) => {
  const data = response.data;
  console.log(data.notes);
});
```

### Using `ListAllPublicNotes`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAllPublicNotesRef } from '@dataconnect/generated';


// Call the `listAllPublicNotesRef()` function to get a reference to the query.
const ref = listAllPublicNotesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAllPublicNotesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.notes);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.notes);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateNote
You can execute the `CreateNote` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createNote(vars: CreateNoteVariables): MutationPromise<CreateNoteData, CreateNoteVariables>;

interface CreateNoteRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNoteVariables): MutationRef<CreateNoteData, CreateNoteVariables>;
}
export const createNoteRef: CreateNoteRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createNote(dc: DataConnect, vars: CreateNoteVariables): MutationPromise<CreateNoteData, CreateNoteVariables>;

interface CreateNoteRef {
  ...
  (dc: DataConnect, vars: CreateNoteVariables): MutationRef<CreateNoteData, CreateNoteVariables>;
}
export const createNoteRef: CreateNoteRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createNoteRef:
```typescript
const name = createNoteRef.operationName;
console.log(name);
```

### Variables
The `CreateNote` mutation requires an argument of type `CreateNoteVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateNoteVariables {
  notebookId: UUIDString;
  content: string;
  isFavorite: boolean;
  title: string;
}
```
### Return Type
Recall that executing the `CreateNote` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateNoteData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateNoteData {
  note_insert: Note_Key;
}
```
### Using `CreateNote`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createNote, CreateNoteVariables } from '@dataconnect/generated';

// The `CreateNote` mutation requires an argument of type `CreateNoteVariables`:
const createNoteVars: CreateNoteVariables = {
  notebookId: ..., 
  content: ..., 
  isFavorite: ..., 
  title: ..., 
};

// Call the `createNote()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createNote(createNoteVars);
// Variables can be defined inline as well.
const { data } = await createNote({ notebookId: ..., content: ..., isFavorite: ..., title: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createNote(dataConnect, createNoteVars);

console.log(data.note_insert);

// Or, you can use the `Promise` API.
createNote(createNoteVars).then((response) => {
  const data = response.data;
  console.log(data.note_insert);
});
```

### Using `CreateNote`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createNoteRef, CreateNoteVariables } from '@dataconnect/generated';

// The `CreateNote` mutation requires an argument of type `CreateNoteVariables`:
const createNoteVars: CreateNoteVariables = {
  notebookId: ..., 
  content: ..., 
  isFavorite: ..., 
  title: ..., 
};

// Call the `createNoteRef()` function to get a reference to the mutation.
const ref = createNoteRef(createNoteVars);
// Variables can be defined inline as well.
const ref = createNoteRef({ notebookId: ..., content: ..., isFavorite: ..., title: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createNoteRef(dataConnect, createNoteVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.note_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.note_insert);
});
```

## AddTagToNote
You can execute the `AddTagToNote` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
addTagToNote(vars: AddTagToNoteVariables): MutationPromise<AddTagToNoteData, AddTagToNoteVariables>;

interface AddTagToNoteRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddTagToNoteVariables): MutationRef<AddTagToNoteData, AddTagToNoteVariables>;
}
export const addTagToNoteRef: AddTagToNoteRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addTagToNote(dc: DataConnect, vars: AddTagToNoteVariables): MutationPromise<AddTagToNoteData, AddTagToNoteVariables>;

interface AddTagToNoteRef {
  ...
  (dc: DataConnect, vars: AddTagToNoteVariables): MutationRef<AddTagToNoteData, AddTagToNoteVariables>;
}
export const addTagToNoteRef: AddTagToNoteRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addTagToNoteRef:
```typescript
const name = addTagToNoteRef.operationName;
console.log(name);
```

### Variables
The `AddTagToNote` mutation requires an argument of type `AddTagToNoteVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AddTagToNoteVariables {
  noteId: UUIDString;
  tagId: UUIDString;
}
```
### Return Type
Recall that executing the `AddTagToNote` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddTagToNoteData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddTagToNoteData {
  noteTag_insert: NoteTag_Key;
}
```
### Using `AddTagToNote`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addTagToNote, AddTagToNoteVariables } from '@dataconnect/generated';

// The `AddTagToNote` mutation requires an argument of type `AddTagToNoteVariables`:
const addTagToNoteVars: AddTagToNoteVariables = {
  noteId: ..., 
  tagId: ..., 
};

// Call the `addTagToNote()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addTagToNote(addTagToNoteVars);
// Variables can be defined inline as well.
const { data } = await addTagToNote({ noteId: ..., tagId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addTagToNote(dataConnect, addTagToNoteVars);

console.log(data.noteTag_insert);

// Or, you can use the `Promise` API.
addTagToNote(addTagToNoteVars).then((response) => {
  const data = response.data;
  console.log(data.noteTag_insert);
});
```

### Using `AddTagToNote`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addTagToNoteRef, AddTagToNoteVariables } from '@dataconnect/generated';

// The `AddTagToNote` mutation requires an argument of type `AddTagToNoteVariables`:
const addTagToNoteVars: AddTagToNoteVariables = {
  noteId: ..., 
  tagId: ..., 
};

// Call the `addTagToNoteRef()` function to get a reference to the mutation.
const ref = addTagToNoteRef(addTagToNoteVars);
// Variables can be defined inline as well.
const ref = addTagToNoteRef({ noteId: ..., tagId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addTagToNoteRef(dataConnect, addTagToNoteVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.noteTag_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.noteTag_insert);
});
```

