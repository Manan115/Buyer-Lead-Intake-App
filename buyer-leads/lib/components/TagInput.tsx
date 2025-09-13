"use client";

import { useState } from "react";

const SUGGESTED_TAGS = ["Hot", "Cold", "Investor", "NRI", "First-time", "Urgent"];

export default function TagInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const addTag = (tag: string) => {
    if (!value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const filteredSuggestions = SUGGESTED_TAGS.filter(
    (tag) => tag.toLowerCase().includes(input.toLowerCase()) && !value.includes(tag)
  );

  return (
  <div className="w-full p-2 border border-gray-300 rounded-md bg-inherit focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 text-red-600 font-bold"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type to add tag"
        className="w-full p-2 rounded outline-none focus:outline-none bg-inherit"
      />
      {input && filteredSuggestions.length > 0 && (
        <ul className="mt-1 rounded bg-white border border-gray-200">
          {filteredSuggestions.map((s) => (
            <li
              key={s}
              onClick={() => addTag(s)}
              className="p-1 cursor-pointer hover:bg-gray-100"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
