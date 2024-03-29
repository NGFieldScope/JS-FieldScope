﻿using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Text;
using System.Text;
using ESRI.ArcGIS.ADF.ArcGISServer;

namespace ArcGIS {

    class LegendBitmapGenerator : IDisposable {

        private Graphics _graphics;
        private int _width;
        private float _resolution;
        private int _margin;
        private int _indentLevel;
        private Font _font;
        private Brush _brush;
        private bool _antialias;

        public int Margin { get { return _margin; } set { _margin = value; } }
        public int IndentLevel { get { return _indentLevel; } set { _indentLevel = value; } }
        public Font Font { get { return _font; } set { _font = value; } }
        public Brush Brush { get { return _brush; } set { _brush = value; } }
        public bool Antialias { get { return _antialias; } set { _antialias = value; } }

        public LegendBitmapGenerator (Bitmap scratchBitmap) {
            _graphics = Graphics.FromImage(scratchBitmap);
            _width = scratchBitmap.Width;
            _resolution = Math.Max(scratchBitmap.HorizontalResolution, scratchBitmap.VerticalResolution);
            _margin = 10;
            _indentLevel = 0;
            _font = new Font("Verdana", 8, System.Drawing.FontStyle.Bold);
            _brush = new SolidBrush(System.Drawing.Color.Black);
            _antialias = false;
        }

        public Bitmap Generate (string text) {
            SizeF textSize = _graphics.MeasureString(text, _font, (int)(_width - (_margin * (_indentLevel + 2))));
            Bitmap result = new Bitmap(_width, (int)textSize.Height);
            result.SetResolution(_resolution, _resolution);
            Graphics g = Graphics.FromImage(result);
            g.Clear(System.Drawing.Color.White);
            if (_antialias) {
                g.TextRenderingHint = TextRenderingHint.AntiAliasGridFit;
            }
            RectangleF textArea = new RectangleF(_margin * (_indentLevel + 1),
                                                 0,
                                                 _width - (_margin * (_indentLevel + 2)),
                                                 textSize.Height);
            g.DrawString(text, _font, _brush, textArea);
            g.Dispose();
            return result;
        }

        public Bitmap Generate (Bitmap icon, string text) {
            float iconWidth = icon.Width * (_resolution / icon.HorizontalResolution);
            if (iconWidth > 100) {
                iconWidth = 100;
            }
            SizeF textSize = _graphics.MeasureString(text, _font, (int)(_width - iconWidth - (_margin * (_indentLevel + 2))));
            float height = Math.Max(icon.Height * (_resolution / icon.VerticalResolution), textSize.Height);
            Bitmap result = new Bitmap(_width, (int)height);
            result.SetResolution(_resolution, _resolution);
            Graphics g = Graphics.FromImage(result);
            g.Clear(System.Drawing.Color.White);
            if (_antialias) {
                g.TextRenderingHint = TextRenderingHint.AntiAliasGridFit;
            }
            g.DrawImage(icon, _margin * (_indentLevel + 1), 0);
            RectangleF textArea = new RectangleF(iconWidth + (_margin * (_indentLevel + 1)),
                                                 0,
                                                 _width - iconWidth - (_margin * (_indentLevel + 2)),
                                                 height);
            g.DrawString(text, _font, _brush, textArea);
            g.Dispose();
            return result;
        }

        public void Dispose () {
            _graphics.Dispose();
        }
    }

    public class MapService {

        public static Bitmap GetLegendImage (string serviceUri,
                                             int width,
                                             int height,
                                             int resolution,
                                             Font font,
                                             bool antialias) {
            MapServerProxy proxy = new MapServerProxy(serviceUri);
            string mapName = proxy.GetDefaultMapName();
            ImageType imageType = new ImageType();
            imageType.ImageFormat = esriImageFormat.esriImageBMP;
            imageType.ImageReturnType = esriImageReturnType.esriImageReturnMimeData;
            MapServerLegendInfo[] legends = proxy.GetLegendInfo(mapName, null, null, imageType);
            List<Bitmap> legendEntries = new List<Bitmap>();
            Bitmap result = null;
            if (height > 0) {
                result = new Bitmap(width, height);
                result.SetResolution(resolution, resolution);
            }
            if (legends != null && legends.Length > 0) {
                Bitmap scratchBitmap = result;
                if (scratchBitmap == null) {
                    scratchBitmap = new Bitmap(width, 500);
                    scratchBitmap.SetResolution(resolution, resolution);
                }
                LegendBitmapGenerator gen = new LegendBitmapGenerator(scratchBitmap);
                gen.Margin = 10;
                gen.IndentLevel = 0;
                gen.Font = font;
                gen.Brush = new SolidBrush(System.Drawing.Color.Black);
                gen.Antialias = antialias;
                foreach (MapServerLegendInfo legend in legends) {
                    if (legend.Name.Length > 0) {
                        legendEntries.Add(gen.Generate(legend.Name));
                    }
                    gen.IndentLevel += 1;
                    foreach (MapServerLegendGroup group in legend.LegendGroups) {
                        if (group.Heading.Length > 0) {
                            legendEntries.Add(gen.Generate(group.Heading));
                        }
                        gen.IndentLevel += 1;
                        foreach (MapServerLegendClass legendClass in group.LegendClasses) {
                            legendEntries.Add(gen.Generate(new Bitmap(new System.IO.MemoryStream(legendClass.SymbolImage.ImageData)),
                                                           legendClass.Label));
                        }
                        gen.IndentLevel -= 1;
                    }
                    gen.IndentLevel -= 1;
                }
                gen.Dispose();
            }
            int legendEntryPadding = 2;
            if (result == null) {
                height = legendEntryPadding;
                foreach (Bitmap entry in legendEntries) {
                    height += legendEntryPadding + entry.Height;
                }
                result = new Bitmap(width, height);
                result.SetResolution(resolution, resolution);
            }
            int currentY = legendEntryPadding;
            Graphics graphics = Graphics.FromImage(result);
            graphics.Clear(System.Drawing.Color.White);
            foreach (Bitmap entry in legendEntries) {
                if ((currentY + entry.Height) <= height) {
                    graphics.DrawImage(entry, 0, currentY);
                    currentY += legendEntryPadding + entry.Height;
                }
            }
            graphics.Dispose();
            //result.MakeTransparent(result.GetPixel(0, 0));
            return result;
        }

        public static StringBuilder GetLegendJson (string serviceUri) {
            StringBuilder result = new StringBuilder();
            result.Append("[");
            MapServerProxy proxy = new MapServerProxy(serviceUri);
            string mapName = proxy.GetDefaultMapName();
            ImageType imageType = new ImageType();
            imageType.ImageFormat = esriImageFormat.esriImageBMP;
            imageType.ImageReturnType = esriImageReturnType.esriImageReturnMimeData;

            MapServerLegendInfo[] legends = proxy.GetLegendInfo(mapName, null, null, imageType);
            if (legends != null && legends.Length > 0) {
                bool firstLegend = true;
                foreach (MapServerLegendInfo legend in legends) {
                    if (firstLegend) {
                        firstLegend = false;
                    } else {
                        result.Append(",");
                    }
                    result.Append("{");
                    if (legend.Name.Length > 0) {
                        result.Append("\"Name\":\"");
                        result.Append(legend.Name);
                        result.Append("\",");
                    }
                    result.Append("\"Groups\":[");
                    bool firstGroup = true;
                    foreach (MapServerLegendGroup group in legend.LegendGroups) {
                        if (firstGroup) {
                            firstGroup = false;
                        } else {
                            result.Append(",");
                        }
                        result.Append("{");
                        if (group.Heading.Length > 0) {
                            result.Append("\"Heading\":\"");
                            result.Append(group.Heading);
                            result.Append("\",");
                        }
                        result.Append("\"Entries\":[");
                        bool firstEntry = true;
                        for (int i = 0; i < group.LegendClasses.Length; i += 1) {
                            MapServerLegendClass legendClass = group.LegendClasses[i];
                            if (firstEntry) {
                                firstEntry = false;
                            } else {
                                result.Append(",");
                            }
                            result.Append("{\"Label\":\"");
                            result.Append(legendClass.Label);
                            result.Append("\",");
                            Bitmap colors = new Bitmap(new System.IO.MemoryStream(legendClass.SymbolImage.ImageData));
                            //colors.Save(@"E:\arcgisserver\arcgisoutput\Class" + (i++).ToString() + ".jpg");
                            System.Drawing.Color lc = colors.GetPixel(2, 2);
                            result.Append("\"LineColor\":{\"r\":");
                            result.Append(lc.R);
                            result.Append(",\"g\":");
                            result.Append(lc.G);
                            result.Append(",\"b\":");
                            result.Append(lc.B);
                            result.Append("},");
                            int sampleX = colors.Width / 2;
                            int sampleY;
                            if (group.LegendClasses.Length == 1) {
                                sampleY = colors.Height / 2;
                            } else {
                                sampleY = (int)(3 + ((colors.Height - 6) * (i / (group.LegendClasses.Length - 1.0))));
                            }
                            System.Drawing.Color fc = colors.GetPixel(sampleX, sampleY);
                            result.Append("\"FillColor\":{\"r\":");
                            result.Append(fc.R);
                            result.Append(",\"g\":");
                            result.Append(fc.G);
                            result.Append(",\"b\":");
                            result.Append(fc.B);
                            result.Append("}}");
                        }
                        result.Append("]}");
                    }
                    result.Append("]}");
                }
                result.Append("]");
            }
            return result;
        }
    }

    public class GeocodeResult {
    
        private string _status;
        private int _score = -1;
        private double _x = Double.NaN;
        private double _y = Double.NaN;
        private string _address;

        public string Status { get { return _status; } }
        public int Score { get { return _score; } }
        public double X { get { return _x; } }
        public double Y { get { return _y; } }
        public string Address { get { return _address; } }

        public GeocodeResult (PropertySet properties) {
            foreach (PropertySetProperty property in properties.PropertyArray) {
                if (property.Key == "Status") {
                    _status = (string)property.Value;
                } else if ((property.Key == "Score") && (property.Value != null)) {
                    _score = (short)property.Value;
                } else if ((property.Key == "X") && (property.Value != null)) {
                    _x = (double)property.Value;
                } else if ((property.Key == "Y") && (property.Value != null)) {
                    _y = (double)property.Value;
                } else if (property.Key == "Match_addr") {
                    _address = (string)property.Value;
                }
            }
        }

        public override string ToString () {
            return string.Format("{{X:{0},Y:{1},Status:{2},Score:{3},Address:{4}}}",
                                 _x, _y, _status, _score, _address);
        }
    }

    public class GeocodeService {
        
        public static GeocodeResult Geocode (string serviceUri, string address) {
            GeocodeServerProxy proxy = new GeocodeServerProxy(serviceUri);
            PropertySet geocodePropSet = new PropertySet();
            PropertySetProperty geocodeProp = new PropertySetProperty();
            geocodeProp.Key = "KeyField";
            geocodeProp.Value = address;
            geocodePropSet.PropertyArray = new PropertySetProperty[] { geocodeProp };
            PropertySet results = proxy.GeocodeAddress(geocodePropSet, null);
            return new GeocodeResult(results);
        }
    }
}
