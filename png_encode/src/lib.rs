#![no_std]

extern crate alloc;

use alloc::vec::Vec;
use png::{BitDepth, ColorType, Encoder};
use wasm_bindgen::prelude::*;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn export_png(width: u32, height: u32, pixels: &[u8]) -> Result<Vec<u8>, u8> {
    let mut buffer = Vec::new();

    {
        let (indexed_pixels, palette, trns) = rgba_to_indexed(pixels)?;

        let mut encoder = Encoder::new(&mut buffer, width, height);

        encoder.set_color(ColorType::Indexed);
        encoder.set_depth(BitDepth::Eight);

        encoder.set_palette(palette);
        encoder.set_trns(trns);

        let mut writer = encoder.write_header().map_err(|_| 1)?;

        writer.write_image_data(&indexed_pixels).map_err(|_| 2)?;
    }

    Ok(buffer)
}

const ALPHA_THRESHOLD: u8 = 154;

fn rgba_to_indexed(rgba: &[u8]) -> Result<(Vec<u8>, Vec<u8>, Vec<u8>), u8> {
    let mut palette: Vec<[u8; 3]> = Vec::new();
    let mut alphas: Vec<u8> = Vec::new();

    let mut indexed_pixels = Vec::with_capacity(rgba.len() / 4);

    for chunk in rgba.chunks_exact(4) {
        let rgb = [chunk[0], chunk[1], chunk[2]];
        let a = chunk[3];

        if a < ALPHA_THRESHOLD {
            indexed_pixels.push(0);
            continue;
        }

        let mut found: Option<u8> = None;

        for (i, p) in palette.iter().enumerate() {
            let idx = i as u8 + 1;
            if *p == rgb {
                found = Some(idx);
                break;
            }
        }

        let idx = match found {
            Some(i) => i,

            None => {
                if palette.len() >= 255 {
                    return Err(3);
                }

                let i = palette.len() as u8 + 1;

                palette.push(rgb);
                alphas.push(255);

                i
            }
        };

        indexed_pixels.push(idx);
    }

    let mut flat_palette = Vec::with_capacity((palette.len() + 1) * 3);
    let mut trns = Vec::with_capacity(palette.len() + 1);

    flat_palette.extend_from_slice(&[0, 0, 0]);
    trns.push(0);

    for rgb in palette.iter() {
        flat_palette.extend_from_slice(rgb);
        trns.push(255);
    }

    Ok((indexed_pixels, flat_palette, trns))
}
