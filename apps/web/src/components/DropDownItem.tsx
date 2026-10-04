import type { Area } from "@xe/shared";

const DropDownItem = ({ item, index, activeIndex, ...props }: DropDownItem) => {
  return (
    <li
      role="option"
      aria-selected={index === activeIndex}
      style={{
        padding: "8px 10px",
        cursor: "pointer",
        background: index === activeIndex ? "#f0f0f0" : "white",
      }}
      {...props}
    >
      <div>{item.mainText}</div>
      <div style={{ fontSize: "0.85em", color: "#666" }}>
        {item.secondaryText}
      </div>
    </li>
  );
};

export default DropDownItem;

interface DropDownItem extends React.ComponentProps<"li"> {
  item: Area;
  index: number;
  activeIndex: number;
}
