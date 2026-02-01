import { days, slots } from "./players.js";
import { courts } from "./courts.js";
import { getDriveTime } from "./scheduler.js";

export function renderAvailabilityHeatmap(container, players) {
  container.innerHTML = "";
  const data = [];
  days.forEach((day) => {
    slots.forEach((slot) => {
      const both = players.every((p) => p.availability?.[day]?.[slot]);
      data.push({ day, slot, value: both ? 1 : 0 });
    });
  });

  const width = 320;
  const cell = 24;
  const svg = d3.select(container).append("svg")
    .attr("width", width)
    .attr("height", (slots.length + 1) * cell);

  svg.selectAll("text.day")
    .data(days)
    .enter()
    .append("text")
    .attr("x", (d, i) => i * cell + cell)
    .attr("y", cell - 6)
    .text((d) => d)
    .attr("font-size", 9);

  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d) => days.indexOf(d.day) * cell + cell)
    .attr("y", (d) => slots.indexOf(d.slot) * cell + cell)
    .attr("width", cell - 4)
    .attr("height", cell - 4)
    .attr("rx", 5)
    .attr("fill", (d) => d.value ? "#2E7D32" : "#e0e4e0");
}

export function renderCommuteChart(container) {
  container.innerHTML = "";
  const data = courts.map((court) => ({
    name: court.name.split(" ")[0],
    franklin: getDriveTime("franklin", court.locationCategory),
    murfreesboro: getDriveTime("murfreesboro", court.locationCategory)
  }));

  const width = 320;
  const height = 200;
  const svg = d3.select(container).append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3.scaleBand()
    .domain(data.map((d) => d.name))
    .range([40, width - 10])
    .padding(0.3);

  const y = d3.scaleLinear()
    .domain([0, 35])
    .range([height - 30, 10]);

  svg.append("g")
    .attr("transform", `translate(0, ${height - 30})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .selectAll("text")
    .attr("font-size", 8);

  svg.append("g")
    .attr("transform", "translate(40,0)")
    .call(d3.axisLeft(y).ticks(4))
    .selectAll("text")
    .attr("font-size", 8);

  svg.selectAll(".bar1")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.name))
    .attr("y", (d) => y(d.franklin))
    .attr("width", x.bandwidth() / 2)
    .attr("height", (d) => height - 30 - y(d.franklin))
    .attr("fill", "#2E7D32");

  svg.selectAll(".bar2")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.name) + x.bandwidth() / 2)
    .attr("y", (d) => y(d.murfreesboro))
    .attr("width", x.bandwidth() / 2)
    .attr("height", (d) => height - 30 - y(d.murfreesboro))
    .attr("fill", "#FFEB3B");
}

export function renderHistoryChart(container, history) {
  container.innerHTML = "";
  const width = 320;
  const height = 180;
  const svg = d3.select(container).append("svg")
    .attr("width", width)
    .attr("height", height);

  const data = history.map((h, i) => ({ index: i, value: h.result === "W" ? 1 : 0 }));
  const x = d3.scaleLinear().domain([0, Math.max(1, data.length - 1)]).range([20, width - 20]);
  const y = d3.scaleLinear().domain([0, 1]).range([height - 20, 20]);

  const line = d3.line()
    .x((d) => x(d.index))
    .y((d) => y(d.value));

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#2E7D32")
    .attr("stroke-width", 3)
    .attr("d", line);

  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d.index))
    .attr("cy", (d) => y(d.value))
    .attr("r", 4)
    .attr("fill", "#FFEB3B");
}
