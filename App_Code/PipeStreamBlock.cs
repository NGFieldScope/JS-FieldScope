using System;
using System.Data;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Collections.Generic;

/// <summary>
/// Summary description for PipeStreamBlock
/// </summary>
namespace Utility
{
    public class PipeStreamBlock : PipeStream
    {
        private int _Length = 0;
        private Queue<byte[]> _Buffer = new Queue<byte[]>(1000);

        public PipeStreamBlock(int readWriteTimeout)
            : base(readWriteTimeout)
        {
        }

        protected override void WriteToBuffer(byte[] buffer, int offset, int count)
        {
            byte[] bufferCopy = new byte[count];
            Buffer.BlockCopy(buffer, offset, bufferCopy, 0, count);
            this._Buffer.Enqueue(bufferCopy);
            
            this._Length += count;
        }

        protected override int ReadToBuffer(byte[] buffer, int offset, int count)
        {
            if (0 == this._Buffer.Count) return 0;

            byte[] chunk = this._Buffer.Dequeue();
            // It's possible the chunk has smaller number of bytes than buffer capacity
            Buffer.BlockCopy(chunk, 0, buffer, offset, chunk.Length);

            this._Length -= chunk.Length;
            return chunk.Length;
        }

        public override long Length
        {
            get
            {
                return this._Length;
            }
        }

        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing);

            this._Length = 0;
            _Buffer.Clear();
        }
    }
}