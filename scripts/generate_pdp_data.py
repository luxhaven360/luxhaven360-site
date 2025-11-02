#!/usr/bin/env python3
"""
Generate per-SKU JSON files in product-details/data from:
 - products/shop.json (required)
 - optional CSV overrides (details.csv)

Usage:
  python scripts/generate_pdp_data.py --shop products/shop.json --out product-details/data
  python scripts/generate_pdp_data.py --shop products/shop.json --overrides details.csv --out product-details/data --placeholder-images 4
"""

import argparse, json, csv, os, pathlib
from urllib.parse import quote_plus

def parse_list_field(s):
    if s is None: return []
    s = s.strip()
    if not s: return []
    # support semicolon or pipe separated
    if '|' in s:
        parts = [x.strip() for x in s.split('|') if x.strip()]
    else:
        parts = [x.strip() for x in s.split(';') if x.strip()]
    return parts

def load_overrides(csv_path):
    overrides = {}
    if not csv_path or not os.path.exists(csv_path):
        return overrides
    with open(csv_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for r in reader:
            sku = r.get('sku') or r.get('SKU')
            if not sku:
                continue
            o = {}
            if r.get('images'):
                o['images'] = parse_list_field(r['images'])[:4]
            if r.get('colors'):
                cols = parse_list_field(r['colors'])
                if cols: o.setdefault('options', {})['colors'] = cols
            if r.get('sizes'):
                sizes = parse_list_field(r['sizes'])
                if sizes: o.setdefault('options', {})['sizes'] = sizes
            # specs
            if any(r.get(k) for k in ('composition','origin','weight','fit')):
                o['specs'] = {}
                if r.get('composition'): o['specs']['composition'] = r['composition']
                if r.get('origin'): o['specs']['origin'] = r['origin']
                if r.get('weight'): o['specs']['weight'] = r['weight']
                if r.get('fit'): o['specs']['fit'] = r['fit']
            # reviews
            if r.get('rating') or r.get('review_count') or r.get('reviews_json'):
                rev = {}
                if r.get('rating'): rev['rating'] = float(r['rating'])
                if r.get('review_count'): rev['count'] = int(r['review_count'])
                if r.get('reviews_json'):
                    try:
                        rev['items'] = json.loads(r['reviews_json'])
                    except Exception:
                        rev['items'] = []
                o['reviews'] = rev
            # description override
            if r.get('description'): o['description'] = r['description']
            # size guide (as JSON string)
            if r.get('size_guide_json'):
                try:
                    o['size_guide'] = json.loads(r['size_guide_json'])
                except Exception:
                    pass
            # selected_quantity_default
            if r.get('selected_quantity_default'):
                try:
                    o['selected_quantity_default'] = int(r['selected_quantity_default'])
                except:
                    pass

            overrides[sku] = o
    return overrides

def make_placeholder_images(title, n=4):
    # Use unsplash / picsum placeholders using title as query (max 4)
    q = quote_plus(title or 'product')
    base = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&h=1600&fit=crop&q="
    # we will just return same base multiple times with different dummy params
    arr = []
    for i in range(n):
        arr.append(f"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&h=1600&fit=crop&ixlib=rb-1.2.1&auto=format&sat=-{i*10}")
    return arr[:n]

def main(args):
    shop_path = args.shop
    out_dir = args.out
    os.makedirs(out_dir, exist_ok=True)

    with open(shop_path, 'r', encoding='utf-8') as f:
        shop = json.load(f)

    overrides = load_overrides(args.overrides) if args.overrides else {}

    created = []
    for prod in shop:
        sku = prod.get('sku') or prod.get('SKU')
        if not sku:
            print("Skipping product w/o SKU:", prod.get('title') or prod)
            continue

        # base structure: only the dynamic fields requested by spec
        data = {}
        data['sku'] = sku
        data['title'] = prod.get('title') or prod.get('name') or ''

        # images: try override -> prod.images -> placeholder
        o = overrides.get(sku, {})
        if 'images' in o and o['images']:
            data['images'] = o['images'][:4]
        else:
            if prod.get('images') and isinstance(prod['images'], list):
                data['images'] = prod['images'][:4]
            else:
                data['images'] = make_placeholder_images(data['title'], n=args.placeholder_images)

        # reviews (only if present)
        if 'reviews' in o:
            if o['reviews']:
                data['reviews'] = o['reviews']
        else:
            if prod.get('reviews'):
                data['reviews'] = prod['reviews']

        # options (colors/sizes) only if present
        if o.get('options'):
            data['options'] = o['options']
        else:
            # try to read from product object (maybe prod.colors/prod.sizes)
            maybe_opts = {}
            if prod.get('colors'): maybe_opts['colors'] = prod['colors']
            if prod.get('sizes'): maybe_opts['sizes'] = prod['sizes']
            if maybe_opts:
                data['options'] = maybe_opts

        # selected quantity default
        if 'selected_quantity_default' in o:
            data['selected_quantity_default'] = o['selected_quantity_default']
        else:
            data['selected_quantity_default'] = prod.get('selected_quantity_default', 1)

        # description
        if 'description' in o:
            data['description'] = o['description']
        else:
            data['description'] = prod.get('desc') or prod.get('description') or ''

        # specs
        if 'specs' in o:
            data['specs'] = o['specs']
        else:
            specs = {}
            if prod.get('composition'): specs['composition'] = prod['composition']
            if prod.get('origin'): specs['origin'] = prod['origin']
            if prod.get('weight'): specs['weight'] = prod['weight']
            if prod.get('fit'): specs['fit'] = prod['fit']
            if specs:
                data['specs'] = specs

        # size_guide
        if 'size_guide' in o:
            data['size_guide'] = o['size_guide']
        else:
            if prod.get('size_guide'): data['size_guide'] = prod['size_guide']

        # write file
        out_path = os.path.join(out_dir, f"{sku}.json")
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        created.append(out_path)

    print(f"Generated {len(created)} files under {out_dir}")
    for p in created[:20]:
        print(" -", p)
    if len(created) > 20:
        print(" ... (+", len(created)-20, "more)")

if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--shop', required=True, help='Path to products/shop.json')
    p.add_argument('--overrides', required=False, help='CSV with overrides (optional)')
    p.add_argument('--out', required=True, help='Output folder (e.g. product-details/data)')
    p.add_argument('--placeholder-images', type=int, default=4, help='How many placeholder images to generate (max 4)')
    args = p.parse_args()
    main(args)
