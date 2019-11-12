using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RetailDemo.Infrastructure.Migrations
{
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EdgeDevices",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    EdgeDeviceId = table.Column<int>(nullable: false),
                    EdgeDeviceName = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EdgeDevices", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ImageEvents",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    ImageEventId = table.Column<int>(nullable: false),
                    Name = table.Column<string>(nullable: true),
                    Type = table.Column<string>(nullable: true),
                    Source = table.Column<string>(nullable: true),
                    CaptureTime = table.Column<DateTimeOffset>(nullable: false),
                    TimeRecieved = table.Column<DateTimeOffset>(nullable: false),
                    EdgeDeviceName = table.Column<string>(nullable: true),
                    RequestId = table.Column<string>(nullable: true),
                    EncodedImage = table.Column<byte[]>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ImageEvents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ToDoItems",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Title = table.Column<string>(nullable: true),
                    Description = table.Column<string>(nullable: true),
                    IsDone = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ToDoItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Body",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    BodyId = table.Column<int>(nullable: false),
                    ModuleId = table.Column<string>(nullable: true),
                    MessageId = table.Column<string>(nullable: true),
                    Src_img = table.Column<string>(nullable: true),
                    Dest_img = table.Column<string>(nullable: true),
                    ImageEventId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Body", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Body_ImageEvents_ImageEventId",
                        column: x => x.ImageEventId,
                        principalTable: "ImageEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Result",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    ResultId = table.Column<int>(nullable: false),
                    Num_detections = table.Column<int>(nullable: false),
                    BodyId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Result", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Result_Body_BodyId",
                        column: x => x.BodyId,
                        principalTable: "Body",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DetectionBoxes",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    DetectionBoxesId = table.Column<int>(nullable: false),
                    ResultId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DetectionBoxes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DetectionBoxes_Result_ResultId",
                        column: x => x.ResultId,
                        principalTable: "Result",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DetectionClass",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    DetectionClassId = table.Column<int>(nullable: false),
                    Detection_class = table.Column<int>(nullable: false),
                    ResultId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DetectionClass", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DetectionClass_Result_ResultId",
                        column: x => x.ResultId,
                        principalTable: "Result",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DetectionScore",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    DetectionScoreId = table.Column<int>(nullable: false),
                    Detection_score = table.Column<double>(nullable: false),
                    ResultId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DetectionScore", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DetectionScore_Result_ResultId",
                        column: x => x.ResultId,
                        principalTable: "Result",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Size",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    SizeId = table.Column<int>(nullable: false),
                    Width = table.Column<string>(nullable: true),
                    Height = table.Column<string>(nullable: true),
                    ResultId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Size", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Size_Result_ResultId",
                        column: x => x.ResultId,
                        principalTable: "Result",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DetectionBox",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    DetectionBoxId = table.Column<int>(nullable: false),
                    Detection_box = table.Column<double>(nullable: false),
                    DetectionBoxesId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DetectionBox", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DetectionBox_DetectionBoxes_DetectionBoxesId",
                        column: x => x.DetectionBoxesId,
                        principalTable: "DetectionBoxes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Body_ImageEventId",
                table: "Body",
                column: "ImageEventId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DetectionBox_DetectionBoxesId",
                table: "DetectionBox",
                column: "DetectionBoxesId");

            migrationBuilder.CreateIndex(
                name: "IX_DetectionBoxes_ResultId",
                table: "DetectionBoxes",
                column: "ResultId");

            migrationBuilder.CreateIndex(
                name: "IX_DetectionClass_ResultId",
                table: "DetectionClass",
                column: "ResultId");

            migrationBuilder.CreateIndex(
                name: "IX_DetectionScore_ResultId",
                table: "DetectionScore",
                column: "ResultId");

            migrationBuilder.CreateIndex(
                name: "IX_Result_BodyId",
                table: "Result",
                column: "BodyId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Size_ResultId",
                table: "Size",
                column: "ResultId",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DetectionBox");

            migrationBuilder.DropTable(
                name: "DetectionClass");

            migrationBuilder.DropTable(
                name: "DetectionScore");

            migrationBuilder.DropTable(
                name: "EdgeDevices");

            migrationBuilder.DropTable(
                name: "Size");

            migrationBuilder.DropTable(
                name: "ToDoItems");

            migrationBuilder.DropTable(
                name: "DetectionBoxes");

            migrationBuilder.DropTable(
                name: "Result");

            migrationBuilder.DropTable(
                name: "Body");

            migrationBuilder.DropTable(
                name: "ImageEvents");
        }
    }
}
