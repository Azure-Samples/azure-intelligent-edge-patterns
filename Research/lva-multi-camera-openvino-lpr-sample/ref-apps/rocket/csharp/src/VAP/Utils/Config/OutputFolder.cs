// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

namespace Utils.Config
{
    public static class OutputFolder
    {
        public static string OutputFolderRoot { get; set; } = "../../";

        public static string OutputFolderAll { get; set; }

        public static string OutputFolderBGSLine { get; set; }

        public static string OutputFolderLtDNN { get; set; }

        public static string OutputFolderCcDNN { get; set; }

        public static string OutputFolderAML { get; set; }

        public static string OutputFolderFrameDNNYolo { get; set; }

        public static string OutputFolderFrameDNNTF { get; set; }

        public static string OutputFolderFrameDNNONNX { get; set; }

        public static void OutputFolderInit()
        {
            OutputFolderAll = OutputFolderRoot + "output_all/";
            OutputFolderBGSLine = OutputFolderRoot + "output_bgsline/";
            OutputFolderLtDNN = OutputFolderRoot + "output_ltdnn/";
            OutputFolderCcDNN = OutputFolderRoot + "output_ccdnn/";
            OutputFolderAML = OutputFolderRoot + "output_aml/";
            OutputFolderFrameDNNYolo = OutputFolderRoot + "output_framednndarknet/";
            OutputFolderFrameDNNTF = OutputFolderRoot + "output_framednntf/";
            OutputFolderFrameDNNONNX = OutputFolderRoot + "output_framednnonnx/";
        }
    }
}
