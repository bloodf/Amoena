"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClientLogger } from "@/lib/client-logger";

const log = createClientLogger("PersonalityStudioPanel");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Persona {
	id: string;
	name: string;
	systemPrompt: string;
	temperature: number;
	topP: number;
	model: string;
	constraints: string[];
	isBuiltin: boolean;
}

interface PersonaFormData {
	name: string;
	systemPrompt: string;
	temperature: number;
	topP: number;
	model: string;
	constraints: string[];
}

const AVAILABLE_MODELS = [
	"claude-sonnet-4-6",
	"claude-haiku-4-5",
	"claude-opus-4-5",
];

const SAMPLE_PROMPT =
	"Explain what a software agent is in two sentences.";

const PERSONA_COLORS: Record<string, string> = {
	default: "border-blue-500/50 bg-blue-500/10",
	cautious: "border-yellow-500/50 bg-yellow-500/10",
	creative: "border-purple-500/50 bg-purple-500/10",
	fast: "border-green-500/50 bg-green-500/10",
};

function personaColor(id: string): string {
	return PERSONA_COLORS[id] ?? "border-gray-500/50 bg-gray-700/20";
}

const DEFAULT_FORM: PersonaFormData = {
	name: "",
	systemPrompt: "",
	temperature: 0.7,
	topP: 0.95,
	model: "claude-sonnet-4-6",
	constraints: [],
};

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export function PersonalityStudioPanel() {
	const [personas, setPersonas] = useState<Persona[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showEditor, setShowEditor] = useState(false);
	const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
	const [applyTarget, setApplyTarget] = useState<string>("");
	const [agents, setAgents] = useState<Array<{ id: number; name: string }>>([]);

	const fetchPersonas = useCallback(async () => {
		try {
			setError(null);
			const res = await fetch("/api/personas");
			if (!res.ok) throw new Error("Failed to fetch personas");
			const data = await res.json();
			setPersonas(data.personas ?? []);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setLoading(false);
		}
	}, []);

	const fetchAgents = useCallback(async () => {
		try {
			const res = await fetch("/api/agents");
			if (!res.ok) return;
			const data = await res.json();
			setAgents(
				(data.agents ?? []).map((a: any) => ({ id: a.id, name: a.name })),
			);
		} catch {
			// non-critical
		}
	}, []);

	useEffect(() => {
		fetchPersonas();
		fetchAgents();
	}, [fetchPersonas, fetchAgents]);

	const handleCreate = () => {
		setEditingPersona(null);
		setShowEditor(true);
	};

	const handleEdit = (persona: Persona) => {
		setEditingPersona(persona);
		setShowEditor(true);
	};

	const handleDuplicate = (persona: Persona) => {
		setEditingPersona({
			...persona,
			id: "",
			name: `${persona.name} (copy)`,
			isBuiltin: false,
		});
		setShowEditor(true);
	};

	const handleDelete = async (persona: Persona) => {
		if (!confirm(`Delete persona "${persona.name}"?`)) return;
		try {
			const res = await fetch(`/api/personas?id=${encodeURIComponent(persona.id)}`, {
				method: "DELETE",
			});
			if (!res.ok) {
				const body = await res.json();
				throw new Error(body.error ?? "Delete failed");
			}
			await fetchPersonas();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Delete failed");
		}
	};

	const handleApply = async (persona: Persona) => {
		if (!applyTarget) {
			setError("Select an agent first");
			return;
		}
		try {
			const res = await fetch("/api/agents", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: applyTarget,
					soul_content: persona.systemPrompt,
					config: {
						persona_id: persona.id,
						temperature: persona.temperature,
						top_p: persona.topP,
						model: persona.model,
					},
				}),
			});
			if (!res.ok) throw new Error("Failed to apply persona");
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Apply failed");
		}
	};

	if (loading) {
		return (
			<div className="h-full flex items-center justify-center bg-gray-900">
				<span className="text-gray-400">Loading personas...</span>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col bg-gray-900">
			{/* Header */}
			<div className="flex items-center justify-between p-4 border-b border-gray-700">
				<div>
					<h2 className="text-xl font-bold text-white">Personality Studio</h2>
					<p className="text-sm text-gray-400 mt-0.5">
						Manage SOUL profiles — model, prompt, and sampling parameters
					</p>
				</div>
				<div className="flex items-center gap-2">
					{agents.length > 0 && (
						<select
							value={applyTarget}
							onChange={(e) => setApplyTarget(e.target.value)}
							className="bg-gray-700 text-white text-sm rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Select agent to apply to…</option>
							{agents.map((a) => (
								<option key={a.id} value={a.name}>
									{a.name}
								</option>
							))}
						</select>
					)}
					<Button onClick={handleCreate} size="sm">
						+ Create Custom
					</Button>
				</div>
			</div>

			{/* Error */}
			{error && (
				<div className="bg-red-900/20 border border-red-500 text-red-400 p-3 mx-4 mt-3 rounded flex items-center justify-between">
					<span>{error}</span>
					<Button
						onClick={() => setError(null)}
						variant="ghost"
						size="icon-sm"
						className="text-red-300 hover:text-red-100"
					>
						×
					</Button>
				</div>
			)}

			{/* Persona grid */}
			<div className="flex-1 overflow-y-auto p-4">
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
					{personas.map((persona) => (
						<PersonaCard
							key={persona.id}
							persona={persona}
							applyTarget={applyTarget}
							onEdit={handleEdit}
							onDuplicate={handleDuplicate}
							onDelete={handleDelete}
							onApply={handleApply}
						/>
					))}
				</div>
			</div>

			{/* Editor modal */}
			{showEditor && (
				<PersonaEditorModal
					persona={editingPersona}
					onClose={() => setShowEditor(false)}
					onSaved={fetchPersonas}
				/>
			)}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Persona card
// ---------------------------------------------------------------------------

function PersonaCard({
	persona,
	applyTarget,
	onEdit,
	onDuplicate,
	onDelete,
	onApply,
}: {
	persona: Persona;
	applyTarget: string;
	onEdit: (p: Persona) => void;
	onDuplicate: (p: Persona) => void;
	onDelete: (p: Persona) => void;
	onApply: (p: Persona) => void;
}) {
	return (
		<div
			className={`rounded-lg border p-4 flex flex-col gap-3 ${personaColor(persona.id)}`}
		>
			{/* Title row */}
			<div className="flex items-start justify-between">
				<div>
					<div className="flex items-center gap-2">
						<h3 className="font-semibold text-white">{persona.name}</h3>
						{persona.isBuiltin && (
							<span className="text-xs bg-gray-600 text-gray-300 px-1.5 py-0.5 rounded">
								built-in
							</span>
						)}
					</div>
					<p className="text-xs text-gray-400 mt-0.5 font-mono">{persona.model}</p>
				</div>
			</div>

			{/* System prompt preview */}
			<p className="text-sm text-gray-300 line-clamp-3 leading-snug">
				{persona.systemPrompt}
			</p>

			{/* Parameters */}
			<div className="grid grid-cols-2 gap-2 text-xs">
				<div className="bg-gray-800/60 rounded p-2">
					<span className="text-gray-400">Temperature</span>
					<div className="text-white font-mono font-semibold">
						{persona.temperature.toFixed(2)}
					</div>
				</div>
				<div className="bg-gray-800/60 rounded p-2">
					<span className="text-gray-400">Top-P</span>
					<div className="text-white font-mono font-semibold">
						{persona.topP.toFixed(2)}
					</div>
				</div>
			</div>

			{/* Constraints */}
			{persona.constraints.length > 0 && (
				<div className="flex flex-wrap gap-1">
					{persona.constraints.map((c) => (
						<span
							key={c}
							className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full"
						>
							{c}
						</span>
					))}
				</div>
			)}

			{/* Actions */}
			<div className="flex gap-1.5 mt-auto pt-1">
				{!persona.isBuiltin && (
					<Button
						onClick={() => onEdit(persona)}
						size="xs"
						variant="secondary"
						className="flex-1"
					>
						Edit
					</Button>
				)}
				<Button
					onClick={() => onDuplicate(persona)}
					size="xs"
					variant="secondary"
					className="flex-1"
				>
					Duplicate
				</Button>
				{!persona.isBuiltin && (
					<Button
						onClick={() => onDelete(persona)}
						size="xs"
						className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
					>
						Delete
					</Button>
				)}
				{applyTarget && (
					<Button
						onClick={() => onApply(persona)}
						size="xs"
						className="flex-1 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
					>
						Apply
					</Button>
				)}
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Editor modal
// ---------------------------------------------------------------------------

function PersonaEditorModal({
	persona,
	onClose,
	onSaved,
}: {
	persona: Persona | null;
	onClose: () => void;
	onSaved: () => void;
}) {
	const isEditing = persona !== null && persona.id !== "";

	const [form, setForm] = useState<PersonaFormData>(() =>
		persona
			? {
					name: persona.name,
					systemPrompt: persona.systemPrompt,
					temperature: persona.temperature,
					topP: persona.topP,
					model: persona.model,
					constraints: [...persona.constraints],
				}
			: { ...DEFAULT_FORM },
	);
	const [newConstraint, setNewConstraint] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [previewing, setPreviewing] = useState(false);

	const setField = <K extends keyof PersonaFormData>(
		key: K,
		value: PersonaFormData[K],
	) => setForm((prev) => ({ ...prev, [key]: value }));

	const addConstraint = () => {
		const c = newConstraint.trim();
		if (!c || form.constraints.includes(c)) return;
		setField("constraints", [...form.constraints, c]);
		setNewConstraint("");
	};

	const removeConstraint = (c: string) => {
		setField(
			"constraints",
			form.constraints.filter((x) => x !== c),
		);
	};

	const handlePreview = async () => {
		setPreviewing(true);
		setPreview(null);
		try {
			// Simulate a preview response based on persona parameters
			const hint =
				form.temperature > 1.0
					? "creative and diverse"
					: form.temperature < 0.4
						? "precise and deterministic"
						: "balanced";
			setPreview(
				`[Preview — ${form.model} @ temp=${form.temperature.toFixed(2)}, top_p=${form.topP.toFixed(2)}]\n\n` +
					`With this persona (${hint}), the model would respond to:\n"${SAMPLE_PROMPT}"\n\n` +
					`System prompt in effect:\n"${form.systemPrompt.slice(0, 120)}${form.systemPrompt.length > 120 ? "…" : ""}"\n\n` +
					(form.constraints.length
						? `Active constraints: ${form.constraints.join(", ")}`
						: "No active constraints."),
			);
		} finally {
			setPreviewing(false);
		}
	};

	const handleSave = async () => {
		setError(null);
		if (!form.name.trim()) {
			setError("Name is required");
			return;
		}
		if (!form.systemPrompt.trim()) {
			setError("System prompt is required");
			return;
		}

		setSaving(true);
		try {
			const payload = {
				id: isEditing ? persona!.id : undefined,
				name: form.name.trim(),
				systemPrompt: form.systemPrompt.trim(),
				temperature: form.temperature,
				topP: form.topP,
				model: form.model,
				constraints: form.constraints,
			};

			const res = await fetch("/api/personas", {
				method: isEditing ? "PUT" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!res.ok) {
				const body = await res.json();
				throw new Error(body.error ?? "Save failed");
			}

			onSaved();
			onClose();
		} catch (err) {
			log.error("Failed to save persona:", err);
			setError(err instanceof Error ? err.message : "Save failed");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
			<div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[92vh] overflow-y-auto">
				<div className="p-6 space-y-5">
					{/* Header */}
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-bold text-white">
							{isEditing ? `Edit: ${persona!.name}` : "Create Custom Persona"}
						</h3>
						<Button onClick={onClose} variant="ghost" size="icon-sm" className="text-xl">
							×
						</Button>
					</div>

					{error && (
						<div className="bg-red-900/20 border border-red-500 text-red-400 p-3 rounded text-sm">
							{error}
						</div>
					)}

					{/* Name */}
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-1">
							Name
						</label>
						<input
							type="text"
							value={form.name}
							onChange={(e) => setField("name", e.target.value)}
							className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="e.g. Research Analyst"
						/>
					</div>

					{/* System prompt */}
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-1">
							System Prompt
							<span className="text-gray-500 ml-2 font-normal text-xs">
								(defines agent behavior and personality)
							</span>
						</label>
						<textarea
							value={form.systemPrompt}
							onChange={(e) => setField("systemPrompt", e.target.value)}
							rows={5}
							className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
							placeholder="You are a helpful AI assistant specialized in..."
						/>
					</div>

					{/* Temperature */}
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-1">
							Temperature:{" "}
							<span className="font-mono text-blue-300">
								{form.temperature.toFixed(2)}
							</span>
						</label>
						<input
							type="range"
							min={0}
							max={2}
							step={0.05}
							value={form.temperature}
							onChange={(e) => setField("temperature", parseFloat(e.target.value))}
							className="w-full accent-blue-500"
						/>
						<div className="flex justify-between text-xs text-gray-500 mt-1">
							<span>0.0 — deterministic</span>
							<span>1.0 — balanced</span>
							<span>2.0 — creative</span>
						</div>
					</div>

					{/* Top-P */}
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-1">
							Top-P:{" "}
							<span className="font-mono text-blue-300">
								{form.topP.toFixed(2)}
							</span>
						</label>
						<input
							type="range"
							min={0.1}
							max={1}
							step={0.01}
							value={form.topP}
							onChange={(e) => setField("topP", parseFloat(e.target.value))}
							className="w-full accent-blue-500"
						/>
						<div className="flex justify-between text-xs text-gray-500 mt-1">
							<span>0.1 — focused</span>
							<span>1.0 — full distribution</span>
						</div>
					</div>

					{/* Model */}
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-1">
							Model
						</label>
						<select
							value={form.model}
							onChange={(e) => setField("model", e.target.value)}
							className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							{AVAILABLE_MODELS.map((m) => (
								<option key={m} value={m}>
									{m}
								</option>
							))}
						</select>
					</div>

					{/* Constraints */}
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-1">
							Constraints
						</label>
						<div className="flex flex-wrap gap-1 mb-2">
							{form.constraints.map((c) => (
								<span
									key={c}
									className="inline-flex items-center gap-1 text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full"
								>
									{c}
									<button
										type="button"
										onClick={() => removeConstraint(c)}
										className="text-gray-500 hover:text-red-400 ml-0.5"
									>
										×
									</button>
								</span>
							))}
						</div>
						<div className="flex gap-2">
							<input
								type="text"
								value={newConstraint}
								onChange={(e) => setNewConstraint(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && addConstraint()}
								placeholder="e.g. no_shell_commands"
								className="flex-1 bg-gray-700 text-white rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							<Button onClick={addConstraint} size="sm" variant="secondary">
								Add
							</Button>
						</div>
					</div>

					{/* Preview */}
					<div>
						<div className="flex items-center justify-between mb-2">
							<label className="text-sm font-medium text-gray-300">
								Preview Response
							</label>
							<Button
								onClick={handlePreview}
								size="sm"
								variant="secondary"
								disabled={previewing}
							>
								{previewing ? "Generating…" : "Preview"}
							</Button>
						</div>
						{preview && (
							<pre className="bg-gray-900 rounded p-3 text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
								{preview}
							</pre>
						)}
					</div>

					{/* Footer actions */}
					<div className="flex gap-3 pt-2 border-t border-gray-700">
						<Button
							onClick={handleSave}
							disabled={saving}
							className="flex-1"
						>
							{saving ? "Saving…" : isEditing ? "Save Changes" : "Create Persona"}
						</Button>
						<Button onClick={onClose} variant="secondary" className="flex-1">
							Cancel
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
