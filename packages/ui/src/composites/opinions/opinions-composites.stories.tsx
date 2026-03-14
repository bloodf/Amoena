import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { OpinionAddForm } from "./OpinionAddForm";
import { OpinionList } from "./OpinionList";
import { OpinionsSidebar } from "./OpinionsSidebar";
import { initialOpinionCategories } from "./data";
import type { Opinion } from "./data";

// ---------------------------------------------------------------------------
// OpinionAddForm
// ---------------------------------------------------------------------------

const addFormMeta: Meta<typeof OpinionAddForm> = {
  title: "Composites/Opinions/OpinionAddForm",
  component: OpinionAddForm,
  args: {
    title: "",
    description: "",
    value: "",
    onTitleChange: fn(),
    onDescriptionChange: fn(),
    onValueChange: fn(),
    onAdd: fn(),
    onCancel: fn(),
  },
};

export default addFormMeta;
type AddFormStory = StoryObj<typeof addFormMeta>;

export const Empty: AddFormStory = {};

export const Prefilled: AddFormStory = {
  args: {
    title: "Enable strict mode",
    description: "Enforces strict type checking across the project",
    value: "true",
  },
};

export const LongContent: AddFormStory = {
  args: {
    title: "Maximum line length for source files",
    description:
      "Controls the maximum number of characters allowed per line in source files. Lines exceeding this limit will be flagged during linting.",
    value: "120",
  },
};

// ---------------------------------------------------------------------------
// OpinionList — exported via a second file‑level meta isn't possible in CSF,
// so we compose stories manually using `render`.
// ---------------------------------------------------------------------------

const sampleOpinions: Opinion[] = initialOpinionCategories[0]?.opinions ?? [
  {
    title: "Use semicolons",
    desc: "Require semicolons at the end of statements",
    value: "true",
    scope: "global",
    editable: true,
  },
  {
    title: "Tab width",
    desc: "Number of spaces per indentation level",
    value: "2",
    scope: "workspace",
    editable: true,
  },
  {
    title: "Quote style",
    desc: "Preferred quote character for strings",
    value: "double",
    scope: "global",
    editable: false,
  },
];

export const ListDefault: AddFormStory = {
  render: () => (
    <OpinionList
      opinions={sampleOpinions}
      categoryIndex={0}
      editingOpinion={null}
      editValue=""
      adding={false}
      selectedCategory={0}
      newTitle=""
      newDescription=""
      newValue=""
      onStartEdit={fn()}
      onEditValueChange={fn()}
      onSaveEdit={fn()}
      onCancelEdit={fn()}
      onDelete={fn()}
      onStartAdd={fn()}
      onNewTitleChange={fn()}
      onNewDescriptionChange={fn()}
      onNewValueChange={fn()}
      onAdd={fn()}
      onCancelAdd={fn()}
    />
  ),
};

export const ListEditing: AddFormStory = {
  render: () => (
    <OpinionList
      opinions={sampleOpinions}
      categoryIndex={0}
      editingOpinion={{ catIndex: 0, opIndex: 1 }}
      editValue="4"
      adding={false}
      selectedCategory={0}
      newTitle=""
      newDescription=""
      newValue=""
      onStartEdit={fn()}
      onEditValueChange={fn()}
      onSaveEdit={fn()}
      onCancelEdit={fn()}
      onDelete={fn()}
      onStartAdd={fn()}
      onNewTitleChange={fn()}
      onNewDescriptionChange={fn()}
      onNewValueChange={fn()}
      onAdd={fn()}
      onCancelAdd={fn()}
    />
  ),
};

export const ListAdding: AddFormStory = {
  render: () => (
    <OpinionList
      opinions={sampleOpinions}
      categoryIndex={0}
      editingOpinion={null}
      editValue=""
      adding={true}
      selectedCategory={0}
      newTitle="New opinion"
      newDescription="A brand-new opinion being added"
      newValue="on"
      onStartEdit={fn()}
      onEditValueChange={fn()}
      onSaveEdit={fn()}
      onCancelEdit={fn()}
      onDelete={fn()}
      onStartAdd={fn()}
      onNewTitleChange={fn()}
      onNewDescriptionChange={fn()}
      onNewValueChange={fn()}
      onAdd={fn()}
      onCancelAdd={fn()}
    />
  ),
};

export const ListEmpty: AddFormStory = {
  render: () => (
    <OpinionList
      opinions={[]}
      categoryIndex={0}
      editingOpinion={null}
      editValue=""
      adding={false}
      selectedCategory={0}
      newTitle=""
      newDescription=""
      newValue=""
      onStartEdit={fn()}
      onEditValueChange={fn()}
      onSaveEdit={fn()}
      onCancelEdit={fn()}
      onDelete={fn()}
      onStartAdd={fn()}
      onNewTitleChange={fn()}
      onNewDescriptionChange={fn()}
      onNewValueChange={fn()}
      onAdd={fn()}
      onCancelAdd={fn()}
    />
  ),
};

// ---------------------------------------------------------------------------
// OpinionsSidebar
// ---------------------------------------------------------------------------

export const SidebarDefault: AddFormStory = {
  render: () => (
    <OpinionsSidebar
      categories={initialOpinionCategories}
      selectedCategory={0}
      onSelect={fn()}
    />
  ),
};

export const SidebarSecondSelected: AddFormStory = {
  render: () => (
    <OpinionsSidebar
      categories={initialOpinionCategories}
      selectedCategory={1}
      onSelect={fn()}
    />
  ),
};

export const SidebarSingleCategory: AddFormStory = {
  render: () => (
    <OpinionsSidebar
      categories={[initialOpinionCategories[0]!]}
      selectedCategory={0}
      onSelect={fn()}
    />
  ),
};
