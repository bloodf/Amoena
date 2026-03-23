"use client";

import { useCallback, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { GoalOptions } from "../types";

const MIN_CHARS = 10;
const MAX_CHARS = 2000;
const CHAR_COUNT_WARN = 1800;

const TIMEOUT_OPTIONS = [
	{ label: "1m", value: 60_000 },
	{ label: "5m", value: 300_000 },
	{ label: "15m", value: 900_000 },
	{ label: "30m", value: 1_800_000 },
];

interface GoalInputProps {
	onSubmit: (description: string, options: GoalOptions) => void;
	isSubmitting: boolean;
	disabled?: boolean;
}

export function GoalInput({ onSubmit, isSubmitting, disabled }: GoalInputProps) {
	const t = useTranslations("missionControl");
	const charCountId = useId();
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const [description, setDescription] = useState("");
	const [showOptions, setShowOptions] = useState(false);
	const [concurrency, setConcurrency] = useState(3);
	const [timeoutMs, setTimeoutMs] = useState(300_000);
	const [validationError, setValidationError] = useState<string | null>(null);

	const charCount = description.length;
	const isValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS;
	const isDisabled = disabled || isSubmitting || !isValid;

	const handleSubmit = useCallback(() => {
		if (!description.trim()) {
			setValidationError(t("errorEmptyInput"));
			return;
		}
		if (charCount < MIN_CHARS) {
			setValidationError(t("errorTooShort", { min: MIN_CHARS }));
			return;
		}
		setValidationError(null);
		onSubmit(description, { maxConcurrency: concurrency, timeoutMs });
	}, [description, charCount, concurrency, timeoutMs, onSubmit, t]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
				e.preventDefault();
				if (!isDisabled) handleSubmit();
			}
		},
		[isDisabled, handleSubmit],
	);

	const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const val = e.target.value;
		if (val.length <= MAX_CHARS) {
			setDescription(val);
			if (validationError && val.length >= MIN_CHARS) setValidationError(null);
		}
	}, [validationError]);

	return (
		<div className="flex flex-col gap-3">
			{/* Textarea */}
			<div className="relative">
				<textarea
					ref={textareaRef}
					value={description}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					rows={3}
					className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3
						focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none
						placeholder:text-gray-500 text-sm leading-relaxed"
					style={{ minHeight: "80px", maxHeight: "200px" }}
					placeholder={t("goalPlaceholder")}
					disabled={disabled || isSubmitting}
					aria-label={t("goalAriaLabel")}
					aria-describedby={charCountId}
					aria-invalid={!!validationError}
				/>
				{/* Char count warning */}
				{charCount > CHAR_COUNT_WARN && (
					<div
						id={charCountId}
						className="absolute bottom-2 right-3 text-xs text-yellow-400"
						aria-live="polite"
					>
						{MAX_CHARS - charCount} {t("charsRemaining")}
					</div>
				)}
				{charCount <= CHAR_COUNT_WARN && <span id={charCountId} className="sr-only" />}
			</div>

			{/* Validation error */}
			{validationError && (
				<p className="text-red-400 text-sm" role="alert">
					{validationError}
				</p>
			)}

			{/* Options toggle */}
			<button
				type="button"
				onClick={() => setShowOptions((s) => !s)}
				className="text-xs text-gray-400 hover:text-gray-200 self-start transition-colors min-h-[44px] min-w-[44px] flex items-center gap-1"
			>
				{t("options")} {showOptions ? "▴" : "▾"}
			</button>

			{/* Advanced options */}
			{showOptions && (
				<div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex flex-col gap-4">
					{/* Concurrency */}
					<div>
						<label className="text-sm text-gray-300 block mb-2">
							{t("concurrency")}: {concurrency}
						</label>
						<input
							type="range"
							min={1}
							max={5}
							value={concurrency}
							onChange={(e) => setConcurrency(Number(e.target.value))}
							className="w-full accent-blue-500"
						/>
						<div className="flex justify-between text-xs text-gray-500 mt-1">
							<span>1</span>
							<span>5</span>
						</div>
					</div>

					{/* Timeout */}
					<div>
						<label className="text-sm text-gray-300 block mb-2">{t("timeout")}</label>
						<div className="flex gap-2 flex-wrap">
							{TIMEOUT_OPTIONS.map((opt) => (
								<button
									key={opt.value}
									type="button"
									onClick={() => setTimeoutMs(opt.value)}
									className={`px-3 py-1.5 rounded text-sm min-h-[44px] min-w-[44px] transition-colors ${
										timeoutMs === opt.value
											? "bg-blue-600 text-white"
											: "bg-gray-700 text-gray-300 hover:bg-gray-600"
									}`}
								>
									{opt.label}
								</button>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Launch button */}
			<div className="flex justify-end">
				<button
					type="button"
					onClick={handleSubmit}
					disabled={isDisabled}
					aria-busy={isSubmitting}
					className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700
						disabled:text-gray-500 text-white font-medium rounded-lg transition-colors
						min-h-[44px] min-w-[44px] text-sm flex items-center gap-2"
				>
					{isSubmitting ? (
						<>
							<span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
							{t("launching")}
						</>
					) : (
						t("launch")
					)}
				</button>
			</div>
		</div>
	);
}
