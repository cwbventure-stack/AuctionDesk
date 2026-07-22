// Self-contained inventory widget for a dealer's existing website.
//
// The dealer pastes two lines into Wix/Squarespace/WordPress and their live
// inventory shows up, styled to blend in and linking back to the full listing.
// No build step, no framework, no dependency on us being up at page-render time
// beyond one fetch.
//
// Everything from the API is inserted as text nodes rather than HTML — a vehicle
// trim is dealer-entered data, and this script runs on somebody else's domain.
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const exists = await prisma.dealership.findUnique({ where: { slug }, select: { id: true } });
  if (!exists) {
    return new Response(`console.warn("AuctionDesk: unknown dealership '${slug}'");`, {
      status: 404,
      headers: { "content-type": "application/javascript; charset=utf-8" },
    });
  }

  const origin = process.env.APP_URL?.replace(/\/+$/, "") ?? new URL(request.url).origin;
  const feedUrl = `${origin}/api/feed/${slug}/inventory.json`;

  const script = `(function () {
  "use strict";

  var MOUNT_ID = "auctiondesk-inventory";
  var FEED = ${JSON.stringify(feedUrl)};

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = String(text);
    return node;
  }

  function money(n) {
    return "$" + Number(n).toLocaleString("en-US");
  }

  function styles() {
    if (document.getElementById("auctiondesk-styles")) return;
    var css = document.createElement("style");
    css.id = "auctiondesk-styles";
    css.textContent = [
      "#" + MOUNT_ID + "{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));font-family:inherit}",
      ".ad-card{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#fff;text-decoration:none;color:inherit;display:flex;flex-direction:column;transition:box-shadow .15s}",
      ".ad-card:hover{box-shadow:0 4px 12px rgba(0,0,0,.08)}",
      ".ad-photo{width:100%;aspect-ratio:4/3;object-fit:cover;background:#f1f5f9;display:block}",
      ".ad-nophoto{width:100%;aspect-ratio:4/3;background:#f1f5f9;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:13px}",
      ".ad-body{padding:12px}",
      ".ad-title{font-weight:600;font-size:14px;line-height:1.3;margin:0 0 4px}",
      ".ad-meta{font-size:12px;color:#64748b;margin:0 0 8px}",
      ".ad-price{font-weight:700;font-size:16px;margin:0}",
      ".ad-empty{grid-column:1/-1;color:#64748b;font-size:14px;padding:24px 0;text-align:center}",
    ].join("");
    document.head.appendChild(css);
  }

  function render(mount, data) {
    mount.textContent = "";
    if (!data.vehicles.length) {
      mount.appendChild(el("p", "ad-empty", "No vehicles listed right now — check back soon."));
      return;
    }
    data.vehicles.forEach(function (v) {
      var card = el("a", "ad-card");
      card.href = v.url;
      card.target = "_blank";
      card.rel = "noopener";

      if (v.photo) {
        var img = el("img", "ad-photo");
        img.src = v.photo;
        img.alt = v.title;
        img.loading = "lazy";
        card.appendChild(img);
      } else {
        card.appendChild(el("div", "ad-nophoto", "Photos coming soon"));
      }

      var body = el("div", "ad-body");
      body.appendChild(el("p", "ad-title", v.title));
      var bits = [Number(v.mileage).toLocaleString("en-US") + " mi"];
      if (v.color) bits.push(v.color);
      body.appendChild(el("p", "ad-meta", bits.join(" · ")));
      body.appendChild(el("p", "ad-price", money(v.price)));
      card.appendChild(body);
      mount.appendChild(card);
    });
  }

  function start() {
    var mount = document.getElementById(MOUNT_ID);
    if (!mount) {
      console.warn("AuctionDesk: add <div id=\\"" + MOUNT_ID + "\\"></div> where you want inventory to appear.");
      return;
    }
    styles();
    mount.appendChild(el("p", "ad-empty", "Loading inventory…"));
    fetch(FEED)
      .then(function (r) { return r.json(); })
      .then(function (data) { render(mount, data); })
      .catch(function () {
        mount.textContent = "";
        mount.appendChild(el("p", "ad-empty", "Inventory is temporarily unavailable."));
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();`;

  return new Response(script, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=600",
    },
  });
}
